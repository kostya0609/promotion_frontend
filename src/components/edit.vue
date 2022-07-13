<template>
  <div v-loading="loading">

    <div class="add-form-row">
      <label class="add-form-label ">Название акции</label>
      <div class="add-form-fields">
        <el-input
            placeholder="Название акции"
            v-model="name"
            :class="errors.name  ? 'invalid' : ''"
        >
        </el-input>
      </div>
      <small v-if="errors.name">{{errors.name}}</small>
    </div>

    <div class="add-form-row">
      <label class="add-form-label">Условия акции</label>
      <div class="add-form-fields">
        <el-input
            placeholder="Условия акции"
            v-model="description"
            type="textarea"
            rows="4"
            :class="errors.description  ? 'invalid' : ''"
        >
        </el-input>
      </div>
      <small v-if="errors.description">{{errors.description}}</small>
    </div>

    <div class="add-form-row">
      <label class="add-form-label">Период действия акции</label>
      <div class="add-form-fields two_fields ">
        <el-date-picker
            :picker-options="{ firstDayOfWeek: 1 }"
            v-model="date_start"
            type="date"
            format="dd.MM.yyyy"
            value-format="dd.MM.yyyy"
            placeholder="Начало действия акции"
            :class="errors.date_start || errors.date  ? 'invalid width_100' : 'width_100'"
        >
        </el-date-picker>
        <el-date-picker
            :picker-options="{ firstDayOfWeek: 1 }"
            v-model="date_final"
            type="date"
            format="dd.MM.yyyy"
            value-format="dd.MM.yyyy"
            placeholder="Окончание действия акции"
            :class="errors.date_final || errors.date  ? 'invalid width_100' : 'width_100'"
        >
        </el-date-picker>
      </div>
      <small v-if="errors.date">{{ errors.date}}</small>
      <small v-if="errors.date_start">{{ errors.date_start}}</small>
      <small v-if="errors.date_final">{{ errors.date_final}}</small>
    </div>

    <div class="add-form-row">
      <label class="add-form-label ">Статус акции</label>
      <div class="add-form-fields two_fields" >
        <el-checkbox-group v-model="active"  fill="#909399" text-color="white">
          <el-checkbox-button :label="active ? 'Активная' : 'Не активная'" v-model="active" ></el-checkbox-button>
        </el-checkbox-group>
        <el-upload
            action=""
            ref="upload"
            :auto-upload="false"
            class="width_100"
            :file-list="file_exists"
            :on-change="fileChange"
            :on-remove="fileRemove"
        >
          <el-button
              size="medium"
              icon="el-icon-download"
              type="info"
              class="width_100"
              :disabled="isDisable"
          >
            {{ isDisable ? ' Добавить файлы (не более двух)' : 'Добавить файлы' }}
          </el-button>
        </el-upload>
      </div>
    </div>

    <div class="add-form-row">
      <el-button class="width_100" @click="save">
        Сохранить
      </el-button>
    </div>

  </div>
</template>

<script>
export default {
  name: "edit",
  props : ['info'],
  data(){
    return {
      id          : null,
      name        : null,
      description : null,
      date_start  : null,
      date_final  : null,
      active      : null,
      file        : [],
      file_save   : [],
      file_exists : [],

      errors :{
        name        : null,
        description : null,
        date        : null,
        date_start  : null,
        date_final  : null,
      },
    }
  },
  computed : {
    loading (){
      return this.$store.getters.loading;
    },
    isDisable(){
      return  (this.file_save.length + this.file.length) >= 2 ? true : false;
    },
  },
  methods  : {

    fileChange(file) {
      this.file.push(file.raw);
    },
    fileRemove(file) {
      this.file_save = this.file_save.filter(el => el.uid !== file.uid);
      this.file = this.file.filter(el => el.uid !== file.uid);
    },

    getData(){
      this.id = this.info.id;
      this.name = this.info.name;
      this.description = this.info.description;
      this.date_start = this.info.date_start;
      this.date_final = this.info.date_final;
      this.active = this.info.active;
      this.file_save = this.info.file;
      this.file_exists = this.info.file;
    },
    async save(){

      if (!this.name) return this.errors.name = 'Необходимо ввести название Акции.';
      if (!this.description) return this.errors.description = 'Необходимо ввести условия Акции.';
      if (!this.date_start) return this.errors.date_start = 'Необходимо ввести начало действия Акции.';
      if (!this.date_final) return this.errors.date_final = 'Необходимо ввести окончание действия Акции.';
      if (this.date_start && this.date_final) {
        if (Number(this.date_final.split('.').reverse().join('')) - Number(this.date_start.split('.').reverse().join('')) < 0) {
          return this.errors.date = 'Дата начала действия Акции не может быть позже даты окончания действия Акции.'
        }
      }

      this.$store.commit('setLoading',true);
      let result = null;

      if (this.file.length) {
        let data = new FormData();
        data.append('id',           this.id);
        data.append('name',         this.name);
        data.append('description',  this.description);
        data.append('date_start',   this.date_start);
        data.append('date_final',   this.date_final);
        data.append('active',       this.active ? 1 : 0);
        data.append('name',         this.name);

        for (let i = 0; i < this.file.length; i++) {
          data.append('file[' + i + ']', this.file[i]);
        }
        for (let i = 0; i < this.file_save.length; i++) {
          data.append('file_save[' + i + ']', this.file_save[i].id);
        }

        result = await this.$store.dispatch('query', {
          url         : '/edit',
          data        : data,
          type        : 'file'
        });
      } else {
        this.file_save = this.file_save.map(el => el.id);
        result = await this.$store.dispatch('query', {
          url         : '/edit',
          data        : {
            id          : this.id,
            name        : this.name,
            description : this.description,
            date_start  : this.date_start,
            date_final  : this.date_final,
            active      : this.active ? 1 : 0,
            file_save   : this.file_save,
          },
        });
      }

      if(result.status == 'success') {
        this.$emit('customModal',{key : 'edit',value : false});
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
  },
  created() {
    this.getData();
  },

  watch    : {
    name() {
      this.errors.name = null;
    },
    description() {
      this.errors.description = null;
    },
    date() {
      this.errors.date = null;
    },
    date_start() {
      this.errors.date_start = null;
      this.errors.date = null;
    },
    date_final() {
      this.errors.date_final = null;
      this.errors.date = null;
    },
  },

}
</script>

<style scoped>

</style>