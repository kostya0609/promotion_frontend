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
      <div class="add-form-fields  two_fields">
        <el-checkbox-group v-model="active"  fill="#909399" text-color="white">
          <el-checkbox-button :label="active ? 'Активная' : 'Не активная'" v-model="active" ></el-checkbox-button>
        </el-checkbox-group>
        <el-upload
            action=""
            ref="upload"
            :auto-upload="false"
            class="width_100"
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
  name: "add",
  data(){
    return {
      name        : '',
      description : '',
      date_start  : null,
      date_final  : null,
      active      : false,
      file        : [],

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
      return  this.file.length >= 2 ? true : false;
    },
  },
  methods  : {
    fileChange(file) {
      this.file.push(file.raw);
    },

    fileRemove(file) {
      this.file = this.file.filter(el => el.uid !== file.uid);
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

      let data = new FormData();
      data.append('name',         this.name);
      data.append('description',  this.description);
      data.append('date_start',   this.date_start);
      data.append('date_final',   this.date_final);
      data.append('active',       this.active ? 1 : 0);
      data.append('name',         this.name);

      for (let i = 0; i < this.file.length; i++) {
        data.append('file[' + i + ']', this.file[i]);
      }

      let result = await this.$store.dispatch('query',{
        url  : '/add',
        data : data,
        type : 'file',
      });

      if(result.status == 'success') {
        this.$emit('customModal',{key : 'add',value : false});
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