import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loading   : false,

    domain    :  process.env.NODE_ENV === 'production' ? window.location.origin + '/api/promotions' : 'https://vc.bsi.local/api/promotions',
    //domain      : 'https://bitrix.bsi.local/api/promotions',
    //domain      : 'https://vc.bsi.local/api/promotions',
    userId    : null,
    charters  : [],

    paginationPage      : 1,
    paginationSize      : 10,
  },

  getters : {
    loading  : s => s.loading,
    domain   : s => s.domain,

    userId   : s => s.userId,
    charters : s => char => { return s.charters.indexOf(char) >= 0 ? true : false },

    paginationPage      : s => s.paginationPage,
    paginationSize      : s => s.paginationSize,

  },

  mutations: {
    setLoading(s,v){
      s.loading = v;
    },

    setUserId(s,v){
      s.userId = v;
    },
    setCharters(s,v){
      s.charters = v;
    },

    setPaginationPage(s,v){
      s.paginationPage = v;
    },
    setPaginationSize(s,v){
      s.paginationSize = v;
    },


  },

  actions: {
    async query (ctx, params){
      if(!('type' in params)) params.type = 'json'

      let body, header = {};

      if(params.type == 'json'){
        body = {
          token : window.token,
          ...params.data
        }
        header['Content-Type'] = 'application/json;charset=utf-8';
      }else{
        body = params.data;
        body.append('token',window.token);
      }
      try {
        let query = await fetch(ctx.getters.domain + params.url, {
          method: 'post',
          headers: header,
          body: params.type == 'json' ? JSON.stringify(body) : body
        });
        let result = null;
        params.downloadRequest ? result = query :  result = await query.json();
        return result;
      }catch(e){
        return {'status' : 'error','message' : 'Некорректный ответ сервера'};
      }
    },

    normalizeFilterData(ctx, data){
      let normalFilter = {};
      for (let key in data){
        if ((data[key].type === 'number' || data[key].type === 'date')         && data[key].min)                normalFilter[key] = data[key];
        if ((data[key].type === 'list'   || data[key].type === 'searchlist')   && data[key].value.length > 0 )  normalFilter[key] = data[key];
      }
      return normalFilter;
    },

  },
  modules: {
  }
})
