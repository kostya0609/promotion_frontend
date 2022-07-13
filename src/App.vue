<template>
<div v-if="isToken" class="wrapper">
  <list v-if="isShow"></list>
  <div v-else>
    <el-alert
        :closable="false"
        type="warning"
        title="Необходимые права отсутствуют!"
        description ="У вас нет прав для проомотра информации об акциях"
    >
    </el-alert>
  </div>
</div>
<div v-else>
  <el-alert
    :closable="false"
    type="warning"
    title="Авторизация"
    description ="Ожидание авторизации на сервере!"
  >
  </el-alert>
</div>
</template>
<script>

import list from '@/components/list'
export default {
  name: 'Promotion',
  components: { list },
  data : function (){
    return {
      isToken    : false,
      timerId    : null,
    };
  },
  computed : {
    user_id() {
      return this.$store.getters.userId;
    },
    isShow(){
      //return true;
      return this.$store.getters.charters('show')
    },
  },
  methods : {
    async initData(){
      //console.log('Попытка авторизоваться')
      if (window._userId)  {
        this.$store.commit('setUserId', window._userId);
      } else {
        this.$store.commit('setUserId', null);
      };

      window._token ? window.token = window._token : window.token = '';

      if (window.token) {
        setTimeout(() => {clearInterval(this.timerId)});

        let result = await  this.$store.dispatch('query',{url : '/home',data : { id : this.user_id} });

        this.isToken = true; //в этом случае наверху отрисуется начальный компонент

        if (result.charters)
          this.$store.commit('setCharters', result.charters);
        else
          this.$store.commit('setCharters', []);

      } else {
        this.isToken = false;
        this.$store.commit('setCharters', []);
      };

    },
  },
  async created() {
    await this.initData();
    if (!this.isToken) this.timerId = setInterval( () =>  this.initData(), 5000 );
  },

}
</script>

<style>

.workarea-content-paddings {
  overflow: hidden;
}

.wrapper {
  padding: 10px
}

.menu-right-element-button{
  background: #3bc8f5 !important;
  border-color: #3bc8f5 !important;
  color : white !important;
  text-transform: uppercase;
}

.menu-right-element-button:hover{
  background: #3fddff !important;
}

.button_wrapper{
  display: flex;
}

.add-form-row{
  margin-bottom: 10px;
}

.add-form-fields {
  display: flex;
  margin-top: 5px;
}

.add-form-label{
  font-weight: bold;
}

.two_fields {
  display: grid !important;
  grid-template-columns: 49% 49%;
  grid-gap: 2%;
}

.three_fields {
  display: grid !important;
  grid-template-columns: 32% 32% 32%;
  grid-gap: 2%;
}

.other_fields{
  display: grid !important;
  grid-template-columns: 64% 32%;
  grid-gap: 2%;
}

.width_100 {
  width: 100% !important;
}
.el-upload {
  width: 100% !important;
}

.align_right {
  text-align: right
}

.multiple-value{
  margin-bottom: 10px;
}

.multiple-element{
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #DCDFE6;
  margin-right: 10px;
}

.multiple-element:last-child{
  margin-right: 0;
}

.dialog-button-list {
  width: 100%;
  margin-bottom: 10px !important;
  display: block !important;
  margin-left: 0 !important;
}

.close_search_button {
  float: right;
  padding: 3px 0
}

.margin_right_10{
  margin-right: 10px;
}

small {
  color: #ff2400;
}

.invalid {
  border:solid 1px;
  border-color: #ff2400;
}

</style>
