<template>
  <div v-loading="loading">
    <div class="add-form-row">
      <label class="add-form-label">Пользователь</label>

      <div class="add-form-fields  other_fields">
        <el-select v-model="typeSelected" class="width_100" placeholder="Выбрать тип привелегии">
          <el-option
              v-for="(item,i) in type"
              :key="i"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div class="add-form-fields  other_fields">
        <el-select
          v-model="connect.user"
          filterable
          remote
          reserve-keyword
          placeholder="Укажите ФИО или название отдела"
          :remote-method="searchUser"
          :loading="loading"
          :class="errors.user ? 'invalid' : ''"
      >
        <el-option
            v-for="item in users"
            :key="item.value"
            :label="item.label"
            :value="item.value">
        </el-option>
      </el-select>
        <el-button style="width:100%" @click="addNewUser" >Добавить</el-button>
      </div>

      <small v-if="errors.user">{{ errors.user}}</small>
    </div>
    <div class="add-form-row">
      <el-table
          :data="show.user"
          style="width: 100%">

        <el-table-column
            prop="text"
            :label="'Члены группы - '+ role_name"
            width="300"
        >
        </el-table-column>

        <el-table-column
            prop="child"
            :label="'С иерархией'"
            width="120"
        >

        </el-table-column>

        <el-table-column
            align="right"
        >
          <template #default="scope">
            <el-button
                size="mini"
                type="danger"
                icon="el-icon-remove"
                @click="removeUser(scope.$index)">Удалить</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="add-form-row">
      <label class="add-form-label">Привелегия</label>
      <div class="add-form-fields other_fields">
        <el-select
            v-model="connect.charter"
            placeholder="Привелегии"
            :class="errors.charter ? 'invalid' : ''"
        >
          <el-option
              v-for="item in charters"
              :key="item.value"
              :label="item.label"
              :value="item.value">
          </el-option>
        </el-select>
        <el-button style="width:100%" @click="addNewCharter">Добавить</el-button>
      </div>
      <small v-if="errors.charter">{{ errors.charter}}</small>

    </div>
    <div class="add-form-row">
      <el-table
          :data="show.charter"
          style="width: 100%">
        <el-table-column
            prop="text"
            :label="'Привелегии группы - '+ role_name">
        </el-table-column>
        <el-table-column
            align="right"
        >
          <template #default="scope">
            <el-button
                size="mini"
                type="danger"
                icon="el-icon-remove"
                @click="removeCharter(scope.$index)">Удалить</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
export default {
  name : 'ConnectRole',
  props : ['data'],
  data : function (){
    return {
      typeSelected : 'user',
      type         : [
        {value : 'user',             label : 'Доверенное лицо'},
        {value : 'department',       label : 'Департамент, без иерархиии дочерних подразделений'},
        {value : 'department_child', label : 'Департамент, с иерархией дочерних подразделений'},
      ],
      formData     : {
        charter : [],
        user    : []
      },
      connect      : {
        charter : '',
        user    : '',
      },
      show         : {
        user    : [],
        charter : []
      },
      users        : [],
      charters     : [],
      errors       : {
        user    : null,
        charter : null,
      },
    };
  },

  computed : {

    loading (){
      return this.$store.getters.loading;
    },

    role_id(){
      return this.data.id[0].value;
    },
    role_name(){
      return this.data.name[0].value
    },

  },
  methods : {
    getSyncData : async function(){
      this.$store.commit('setLoading',true);

      let result = await this.$store.dispatch('query',{url : '/role/get-connect',data : {
          id : this.role_id
        }});
      if(result.status == 'success') {
         this.show.user =result.data.user.concat(result.data.department);
         this.show.charter = result.data.charter;
      }
      //ниже получить привелегии для select
      let charter = await this.$store.dispatch('query',{url : '/charter/list',data : {}});
      if(charter.status == 'success') {
        this.charters = [];
        charter.data.forEach(el => {
          this.charters.push({value : el.id[0].value, label : el.name[0].value});
        });
      }
      this.$store.commit('setLoading',false);
    },

    addNewUser(){
      this.connect.user ? this.setSyncUser({action : 'add', id : this.connect.user, type : this.typeSelected}) : this.errors.user = 'Необходимо ввести пользователя или название отдела !'
    },

    setSyncUser : async function(data){
      this.$store.commit('setLoading',true);

      this.show.user.forEach(el => {
        this.formData.user.push(el.value);
      });

      if(this.connect.user !== '')
        this.formData.user.push(this.connect.user);

      let sendData = {}

      if (data.type === 'user') {
          sendData = {
            type : 'user',
            users : this.formData.user,
          };
      };

      if (data.type === 'department') {
        sendData = {
          type : 'department',
          department : {id : data.id, child : 0},
          action : data.action,
        };
      };

      if (data.type === 'department_child') {
        sendData = {
          type : 'department',
          department : {id : data.id, child : 1},
          action : data.action,
        };
      }

      let result = await this.$store.dispatch('query',{url : '/role/set-connect',data : {
          id : this.role_id,
          ...sendData,
        }});
      if(result.status == 'success') {
        this.formData = {
          charter : [],
          user    : []
        }
        this.connect = {
          charter : '',
          user    : ''
        }

        await this.getSyncData();
      }
      this.$notify({
        title                     : result.title,
        message                   : result.message,
        type                      : result.status,
        dangerouslyUseHTMLString  : true,
        duration                  : 10000,
        showClose                 : true
      });

      this.$store.commit('setLoading',false);
    },

    removeUser : function(index){
      this.$confirm(`Вы уверены, что хотите удалить пользователя - ${this.show.user[index].text} ?`).then(() => {
        let id = this.show.user[index].value;
        let type = this.show.user[index].key;
        this.show.user.splice(index,1);
        this.setSyncUser({action : 'delete', id, type });
      }).catch(()=>{});
    },

    addNewCharter(){
      this.connect.charter ? this.setSyncCharter() : this.errors.charter = 'Необходимо выбрать привелегию!'
    },

    async setSyncCharter(){
      this.$store.commit('setLoading',true);

      this.show.charter.forEach(el => {
        this.formData.charter.push(el.value);
      });

      if(this.connect.charter !== '')
        this.formData.charter.push(this.connect.charter);


      let result = await this.$store.dispatch('query',{url : '/role/set-connect',data : {
          id         : this.role_id,
          charters   : this.formData.charter,
          type       : 'charter',
        }});
      if(result.status == 'success') {
        this.formData = {
          charter : [],
          user : []
        }
        this.connect = {
          charter : '',
          user : ''
        }
        await this.getSyncData();
      }
      this.$notify({
        title                     : result.title,
        message                   : result.message,
        type                      : result.status,
        dangerouslyUseHTMLString  : true,
        duration                  : 10000,
        showClose                 : true
      });

      this.$store.commit('setLoading',false);
    },

    removeCharter : function(index){
      this.$confirm(`Вы уверены, что хотите удалить привелегию - ${this.show.charter[index].text}?`).then(() => {
        this.show.charter.splice(index,1);
        this.setSyncCharter();
      }).catch(()=>{});
    },

    searchUser : async function(query){
      this.$store.commit('setLoading',true);
      let result = await this.$store.dispatch('query',{
        url : '/search',
        data :  {q : query, search : this.typeSelected === 'user' ? 'user' : 'department'}
      });
      if(result.status == 'success'){this.users = result.data;}
      this.$store.commit('setLoading',false);
    },
  },

  async created() {
    await this.getSyncData();
  },

  watch:{
    'connect.user' : function(){
      this.errors.user = null;
    },
    'connect.charter' : function(){
      this.errors.charter = null;
    },
    'typeSelected' : function(){
      this.connect.user = [];
    },
  },

}
</script>