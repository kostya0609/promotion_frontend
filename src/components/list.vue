<template>
  <div v-loading="loading">
    <div  class="add-form-row align_right">
      <el-button v-if="isAdmin" @click="openModal.adminButton=true" type="text">
        Администрирование
      </el-button>
      <el-button v-if="isCreate" class="menu-right-element-button" @click="openModal.add=true">
        Добавить акцию
      </el-button>
    </div>

    <Grid
        :name="name"
        v-if="load"
        v-event-bus:onSort="onSort"
    />
<!--    v-event-bus:changeFilterProfile="changeFilterProfile"-->
<!--    v-event-bus:saveVisibleColumn="saveVisibleColumn"-->
<!--    v-event-bus:saveOrderColumn="saveOrderColumn"-->
<!--    v-event-bus:saveWidthColumn="saveWidthColumn"-->

    <el-dialog title="Привелегии пользователей" :visible.sync="openModal.charter" width="80%" @closed="nextModal = null" >
      <charter-list v-if="openModal.charter"/>
    </el-dialog>

    <el-dialog title="Группы пользователей" :visible.sync="openModal.role" width="80%" @closed="nextModal = null">
      <role-list v-if="openModal.role"/>
    </el-dialog>

    <el-dialog title="Добавление акции" :visible.sync="openModal.add" width="50%" @closed="nextModal = null" :close-on-click-modal="false">
      <add v-if="openModal.add" @customModal="showModal" />
    </el-dialog>

    <el-dialog title="Редактирование акции" :visible.sync="openModal.edit" width="80%" @closed="nextModal = null; openModal.info.file = []" :close-on-click-modal="false">
      <edit v-if="openModal.edit" :info="openModal.info" @customModal="showModal"/>
    </el-dialog>

    <el-dialog title="Администрирование" :visible.sync="openModal.adminButton" width="20%" @closed="openNextModal">
      <el-button class="dialog-button-list" @click="setButtonList('charter')" >Привелегии</el-button>
      <el-button class="dialog-button-list" @click="setButtonList('role')"    >Группы</el-button>
    </el-dialog>

  </div>
</template>

<script>

import charterList from '@/components/admin/charter/list'
import roleList from '@/components/admin/role/list'
import add from '@/components/add'
import edit from '@/components/edit'

export default {
  name: "list",
  components: {charterList, roleList, add, edit},
  data() {
    return {
      load: false,
      name: 'promotion',

      openModal: {
        adminButton : false,
        charter     : false,
        role        : false,
        add         : false,
        edit        : false,

        info        : {
          id         : null,
          name       : null,
          date_start : null,
          date_final : null,
          description: null,
          active     : null,
          file       : [],
        },
      },
      nextModal: false,

      grid       : {
        filter: {
          data: {
            id: {
              show : false,
              type: 'number',
              name: 'ID',
            },
            name       : {
              type      : 'searchlist',
              name      : 'Название акции',
              multiple  : true,
              query     : async function (data){
                let result = await this.$store.dispatch('query',{
                  url   : '/search',
                  data  :  {q : data, search : 'promotion'}
                });
                if(result.status == 'success') return result.data
              }.bind(this),

              // ниже строчка которая нужна для грида в компаненте фильтрации в searchlist в методе search взамен  await this.value.query(query);
              // await this.value.query(query) ? this.value.option = await this.value.query(query) : '';

              // ниже код который был бы нужен если не менять в гриде
              // domain    : this.$store.getters.domain,
              // query     : async function(data){
              //    let query = await fetch(this.domain+'/api/vicarious/user/search', {
              //      method: 'post',
              //      headers: {'Content-Type' : 'application/json;charset=utf-8'},
              //      body: JSON.stringify({q : data, token : window.token})
              //    });
              //    let result = await query.json();
              //    if(result.status == 'success')
              //      this.option = result.data;
              // }
            },
            date_start : {
              type : 'date',
              name : 'Дата начала действия акции',
            },
            date_final : {
              type : 'date',
              name : 'Дата окончания действия акции',
            },
            active     : {
              type     : 'list',
              name     : 'Активность',
              multiple : true,
              option   : [
                {value : '1',  label : 'Активная'},
                {value : '0',  label : 'Не активная'}
              ],
            },
          },
          profiles     : [],
          showProfiles : false,
          filter       : function(data){
            this.filterData = data;
            this.$store.commit('setPaginationPage', 1);
            this.getData();
          }.bind(this),
          clear        : function(){
            this.filterData = {};
            this.getData();
          }.bind(this),
        },
        context: [
        ],
        pagination  : {
          show        : 'full',
          defaultSize : 10,
          page        : 1,
          sizes       : [10,20,50],
          changeSize : value => {
            this.$store.commit('setPaginationSize', value);
            this.$grid.commit('normalizePagination', {name : this.grid.name, data : {pagination : {defaultSize : value}}})
            this.getData();
          },
          changePage : value => {
            this.$store.commit('setPaginationPage', value);
            this.getData();
          },
        },
        header: {
          id: {
            name: 'ID',
            width: 100,
            contentSort: true,
          },
          name: {
            name: 'Название',
            width: 200,
          },
          description: {
            name: 'Условия',
            width: 400,
          },
          date_start: {
            name: 'Начало действия',
            width: 200,
            contentSort: true,
          },
          date_final: {
            name: 'Окончание действия',
            width: 200,
            contentSort: true,
          },
          active: {
            name: 'Активное',
            width: 200,
            contentSort: true,
          },
          files            : {
            name  : 'Дополнительные файлы',
            width : 300,
          },
        },
        elements: [],
        settings : false,
      },
      filterData : {},
      sort       : {
        name : 'id',
        order : 'desc',
      },
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    isAdmin() {
      return this.$store.getters.charters('admin')
      //return true;
    },
    isCreate() {
      return this.$store.getters.charters('create')
    },
    isEdit() {
      return this.$store.getters.charters('edit')
      //return false;
    },
  },
  methods: {

    async getData() {
      this.$store.commit('setLoading', true);

      this.grid.filter.data.name.option = [];
      let filter = await this.$store.dispatch('normalizeFilterData', this.filterData);

      let result = await this.$store.dispatch('query', {
        url: '/list',
        data: {
          count    : this.$store.getters.paginationSize,
          page     : this.$store.getters.paginationPage,
          filter   : filter,
          sort     : this.sort,
        }});

      if (result.status == 'success') {
        this.$grid.commit('normalizeElement',{name : this.name ,data : { elements : result.data } });
        this.$grid.commit('normalizePagination', {
          name : this.name,
          data : {
            pagination : { page : this.$store.getters.paginationPage, total : result.total }
          }
        })

      } else
        this.$notify({
          title: 'Ошибка',
          message: 'Некорректный ответ сервера',
          type: 'error',
          dangerouslyUseHTMLString: true,
          duration: 10000,
          showClose: true
        });
      this.$store.commit('setLoading', false);
    },

    setButtonList(key) {
      switch (key) {
        case 'charter' :
          this.openModal.adminButton = false;
          this.nextModal = 'charter';
          break;

        case 'role' :
          this.openModal.adminButton = false;
          this.nextModal = 'role';
          break;
      }
    },

    openNextModal() {
      if (this.nextModal)
        this.openModal[this.nextModal] = true;
    },

    showModal(e) {
      this.openModal[e.key] = e.value;
      this.getData();
    },

    onSort(data){
      this.sort.name = data.key;
      if (this.sort.name === data.key)
        this.sort.order === 'asc' ? this.sort.order = 'desc' : this.sort.order = 'asc';
      else
        this.sort.order = 'desc';
      this.getData();
    },

    saveVisibleColumn(data){
      let setShowValue = data => {
        this.grid.header[data.key].show = data.show;
        if (this.grid.header[data.key].child instanceof Array) {
          this.grid.header[data.key].child.forEach((el, idx) => {
            let newData = {
              key  :  this.grid.header[data.key].child[idx],
              show :  data.show,
            }
            setShowValue(newData);
          }) // перебор массива child
        }//if
      };

      setShowValue(data); //так возможно если это стрелочная функция.
      //setShowValue.call(this, data);
      this.setHeaderParams();
    },

    saveWidthColumn(data){
      this.grid.header[data.key].width = data.width;
      this.setHeaderParams();
    },

    saveOrderColumn(data){
      data.data.forEach(el => {
        let key = el.key, sort = el.params.sort;
        this.grid.header[key].sort = sort;
      });
      this.setHeaderParams();
    },

    async setHeaderParams(){
      let keys = Object.keys(this.grid.header);
      let headerParams = keys.map((el,idx) => {
        let show;
        ('show' in this.grid.header[el]) ? show = this.grid.header[el].show : show = true;
        return {key : el, width : this.grid.header[el].width , show : show, sort : this.grid.header[el].sort}
      })
      let result = await this.$store.dispatch('query',{
        url  : '/setting',
        data : {
          grid    : this.name,
          params  : JSON.stringify(headerParams),
          type    : 'set',
        }
      });
      if(result.status == 'success')
        this.$store.commit('setMessage',{text: result.message, type : 'success'})
      else
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера', header : 'Возникла проблема!', type: 'error'});
    },

    async changeFilterProfile(data){
      this.loading = true;

      if (data.action === 'add') {
        let profilesToSave = [];
        this.grid.filter.profiles.push({name: data.name, data: data.data, id : data.id})

        this.grid.filter.profiles.forEach((el, idx) => {
          if (idx > 0) profilesToSave.push(el)
        })

        let result =  await this.$store.dispatch('query',{
          url  : '/api/vicarious/filter-preset',
          data : {
            grid   : data.grid,
            params : JSON.stringify(profilesToSave) ? JSON.stringify(profilesToSave) : '[]',
            type   : 'set',
          }
        });
        if(result.status == 'success')
          this.$store.commit('setMessage',{text: result.message, type : 'success'})
        else
          this.$store.commit('setMessage',{text : 'Некорректный ответ сервера', header : 'Возникла проблема!', type: 'error'});
      }

      if (data.action === 'remove') {
        let profilesToSave = [];
        this.grid.filter.profiles.splice(data.idx + 1, 1);

        this.grid.filter.profiles.forEach((el, idx) => {
          if (idx > 0) profilesToSave.push(el)
        })

        let result =  await this.$store.dispatch('query',{
          url  : '/api/vicarious/filter-preset',
          data : {
            grid   : data.grid,
            params : JSON.stringify(profilesToSave) ? JSON.stringify(profilesToSave) : '[]',
            type   : 'set',
          }
        });
        if(result.status == 'success')
          this.$store.commit('setMessage',{text: result.message, type : 'success'})
        else
          this.$store.commit('setMessage',{text : 'Некорректный ответ сервера', header : 'Возникла проблема!', type: 'error'});

      };

      if (data.action === 'change') {

        if (data.id === 0){
          this.grid.filter.data = Object.assign({}, this.grid.filter.profiles[0].data);
        } else {
          let needProfile = Object.assign({}, this.grid.filter.profiles.find(el => el.id === data.id)); // нашли нужный профиль который выбрал пользователь
          let needKey = Object.keys(needProfile.data) // список полей которые надо оставить у дефолтового фильтра и обновить сохраненными данными
          if (Object.keys(needProfile)){
            for (let key in this.grid.filter.data){
              if (needKey.includes(key) > 0){
                this.grid.filter.data[key] = {
                  ... this.grid.filter.data[key],
                  ... Object.assign({}, needProfile.data[key])
                }
              } else {
                this.grid.filter.data[key].show = false;
              }
            }// перебор нужного профиля и изменение дефолтового профиля под настройки выбранного профиля
          } // если результат поиска нужного профиля не undefined
        };

        this.$grid.commit('normalizeFilter', {name : this.grid.name, data :{ filter : this.grid.filter} });
      };

      this.loading = false;
    },

    async initGrid(){
      this.$store.commit('setLoading',true);
      let result = null;

      //загружаем настройки  таблицы
      if (this.grid.settings) {
        result = await this.$store.dispatch('query',{
          url  : '/setting',
          data : {
            grid    : this.name,
            type    : 'get',
          }
        });
        if(result.status == 'success' && result.data.length > 0) {
          let headerParams = JSON.parse(result.data[0]);
          headerParams.forEach(el => {
            if ( el.key in this.grid.header) {
              this.grid.header[el.key].show = el.show;
              this.grid.header[el.key].width = el.width;
              this.grid.header[el.key].sort = el.sort;
            }
          });
        }
        if(result.status !== 'success')
          this.$store.commit('setMessage',{text : 'Некорректный ответ сервера', header : 'Возникла проблема!', type: 'error'});
      }

      // загружаем профили фильтров
      if (this.grid.filter.showProfiles) {
        this.grid.filter.profiles.push(
            {
              id   : 0,
              name : 'По умолчанию',
              data : Object.assign({}, this.grid.filter.data)
            }
        )

        result = await this.$store.dispatch('query',{
          url  : '/filter-preset',
          data : {
            grid    : this.grid.name,
            type    : 'get',
          }
        });

        if(result.status === 'success' && result.data.length > 0) {
          let profiles = JSON.parse(result.data);
          profiles.forEach(el => {this.grid.filter.profiles.push(el)});
        }
        if(result.status !== 'success')
          this.$store.commit('setMessage',{text : 'Некорректный ответ сервера', header : 'Возникла проблема!', type: 'error'});

      }

      // добавляем контекст если есть права на редактирование

      if (this.isEdit){
        this.grid.context.push(
            {
              name: 'Редактировать',
              function: (row) => {
                this.openModal.info.id = row.id[0].value;
                this.openModal.info.name = row.name[0].value;
                this.openModal.info.date_start = row.date_start[0].value;
                this.openModal.info.date_final = row.date_final[0].value;
                this.openModal.info.description = row.description[0].value;
                row.active[0].bool === 1 ? this.openModal.info.active = true : this.openModal.info.active = false;
                row.files.forEach(el => { this.openModal.info.file.push( {id : el.id, name : el.name} ) });
                this.openModal.edit = true;
              }
            }
        )

      }

      // стартуем грид с полученными исходными данными
      this.load = this.$grid.dispatch('createGrid', {name : this.name, data : this.grid});

      //получам содержимое таблицы
      await  this.getData();

      this.$store.commit('setLoading',false);
    },
  },
  created() {
    window.loadFile = async (id, fileName, type) => {
      // let el =  event.target.parentNode;
      // el.classList.add('loading');
      // event.preventDefault();
      try {
        let result = await this.$store.dispatch('query', {
          url             : '/files/load',
          downloadRequest : true,
          data            : {id: id, type : type},
        });
        let blob      = await result.blob();
        let url       = URL.createObjectURL(blob);
        let link      = document.createElement('a');
        link.href     = url;
        link.download = fileName;
        //document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(link.href);
      }catch(e){
        this.$store.commit('setMessage',{text : 'Некорректный ответ сервера',header : 'Возникла проблема!', type: 'error'});
      }
      // el.classList.remove('loading');
      return false;
    };
    this.initGrid();



  },
}

</script>

<style scoped>

</style>