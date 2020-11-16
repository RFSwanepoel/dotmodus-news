<template>
  <v-app>
    <v-app-bar app flat class="pa-0 ma-0"  height="150">
      <v-row no-gutters align="center" app>
        <v-col cols="12" md="4" >
          <v-toolbar-title class="BlackChancery">
            <h1>DotModus News</h1>
          </v-toolbar-title>
        </v-col>
        <v-spacer />
        <v-col cols="12" md="8" >
          <v-row no-gutters>
            <v-text-field
              clearable
              v-model="searchString"
              color="primary"
              hide-details
              solo
              rounded 
              dense
              label="Search"
              placeholder="Start typing to Search"
              prepend-inner-icon="fa-search"
              @keydown="clearSearchTimer"
              @keyup="startSearch"
              @click:clear="searchString = null; dateTo = ''; dateFrom = ''; search()"
            ></v-text-field>
          </v-row>
          <v-scroll-y-transition >
            <v-row no-gutters  v-if="searchResults.length > 0">
              <v-col>
                <v-menu
                  v-model="dateMenuFrom"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      clearable
                      v-bind="attrs"
                      v-on="on"
                      class="pr-1 mt-2"
                      v-model="dateFrom"
                      color="primary"
                      hide-details
                      solo
                      rounded 
                      dense
                      label="Search"
                      placeholder="From"
                      prepend-inner-icon="fa-calendar-alt"
                      @click:clear="dateFrom = ''; search()"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dateFrom"
                    reactive
                    event-color="primary"
                    @change="dateMenu = false; search()"
                  />
                </v-menu>
              </v-col>
              <v-col>
                <v-menu
                  v-model="dateMenuTo"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                  >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      clearable
                      v-bind="attrs"
                      v-on="on"
                      class="pl-1 mt-2"
                      v-model="dateTo"
                      color="primary"
                      hide-details
                      solo
                      rounded 
                      dense
                      label="Search"
                      placeholder="To"
                      prepend-inner-icon="fa-calendar-alt"
                      @click:clear="dateTo = ''; search()"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dateTo"
                    reactive
                    event-color="primary"
                    @change="dateMenuTo = false; search()"
                  />
                </v-menu>
              </v-col>
            </v-row>
          </v-scroll-y-transition>
        </v-col>
      </v-row>
    </v-app-bar>
    <v-main>
      <v-container fluid>
        <v-scroll-y-transition >
          <v-row >
            <v-col >
              <v-row v-if="!searchString" class="pa-2" align="center" justify="center">
                Start typing to search for articles
              </v-row>
              <v-row v-if="searchedAndFiltered.length === 0 && !!searchString && isLoading" class="pa-2" align="center" justify="center">
                <v-progress-circular color="primary" indeterminate width="2" size="15" class="mr-2"></v-progress-circular>
                Searching for "{{searchString}}"...
              </v-row>
              <v-row v-if="searchedAndFiltered.length === 0 && !!searchString && !isLoading" class="pa-2" align="center" justify="center">
                No Results found
              </v-row>
              <v-row v-if="searchedAndFiltered.length > 0">
                <template v-for="(article, i) in searchedAndFiltered">
                  <v-col cols="12" :sm="6" :md="4" :lg="3" :key="`article_${i}`">
                    <v-card width="400" style="height:100%">
                      <v-img height="200px" :src="article.urlToImage">
                        <div class="no_poster caption" v-if="!article.urlToImage">No article poster available</div>
                        <v-card-actions >
                          <v-spacer />
                          <v-btn class="absolute bottom" small dense color="primary" target="_blank" :href="article.url">
                            Read full article
                            <v-icon class="pl-5">far fa-newspaper</v-icon>
                          </v-btn>
                        </v-card-actions>
                      </v-img>
                      <v-card-text>
                      <v-card-title class="caption pa-0">
                          {{article.source.name}}
                          <v-spacer />
                          <div>{{new Date(article.publishedAt).toString().split('GMT')[0] }}</div>
                        </v-card-title>
                        <v-divider />
                        <v-card-subtitle><strong>{{ article.title }}</strong></v-card-subtitle>
                        <v-card-subtitle class="caption" v-html="article.content? article.content.split('[')[0] :article.description ?`${article.description}..` : 'No article preview available'"></v-card-subtitle>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </template>
              </v-row>
            </v-col>
          </v-row>
        </v-scroll-y-transition>
      </v-container>
    </v-main>
    <v-footer color="grey">
      <span class="caption">&#169; DotModus News {{new Date().getFullYear()}}</span>
      
    </v-footer>
  </v-app>
</template>

<script>
let searchTimer = null;
import { searchResults, dummyMode } from '@/dummyData'
export default {
  name: 'App',
  data: () => ({
    newsApiCfg: {
      apiKey: '872d5ed3303c4bf285760f5410e8bc30',
      // apiKey: 'a276723b7c2a45ba9481dde7fa7ca4cc',
      country: 'za',
      pageSize: 100
    },
    isLoading: false,
    searchString: '',
    searchResults: [],
    dateMenuFrom: false,
    dateFrom: '',
    dateMenuTo: false,
    dateTo: '',
    
  }),
  computed: {
    searchedAndFiltered(){
      let self = this;
      if(!self.dateFrom && !self.dateTo){
        return [...this.searchResults];
      }

      let dateFrom = false;
      let dateTo = false;
      if(self.dateFrom){
        dateFrom = new Date(self.dateFrom);
        dateFrom.setHours(0,0,0,0)
        dateFrom = dateFrom.getTime();
      }
      if(self.dateTo){
        dateTo = new Date(self.dateTo);
        dateTo.setHours(23,59,59,999)
        dateTo = dateTo.getTime();
      }

      if(!!dateFrom && !!dateTo){
        return [...this.searchResults].filter(o=>{
          let date = new Date(o.publishedAt).getTime();
          if(date >= dateFrom && date <= dateTo){
            return o
          }
        })
      }
      else if(!!dateFrom && !dateTo){
        return [...this.searchResults].filter(o=>{
          let date = new Date(o.publishedAt).getTime();
          if(date >= dateFrom){
            return o
          }
        })
      }
      else if(!dateFrom && !!dateTo){
        return [...this.searchResults].filter(o=>{
          let date = new Date(o.publishedAt).getTime();
          if(date <= dateTo){
            return o
          }
        })
      }
      
    }
  },
  methods:{
    startSearch(){
      searchTimer = setTimeout(this.search, 1000);
    },
    clearSearchTimer(){
      clearTimeout(searchTimer);
    },
    async search(){
      let self = this;

      if(!self.searchString){
        self.searchResults = [];
        return;
      }

      if (self.isLoading) return;
      self.isLoading = true;


      let q = self.searchString;

      let params = {
        q: self.searchString,
        apiKey: self.newsApiCfg.apiKey
      }

      let queryString = Object.keys(params).map(key => {
        return key + '=' + encodeURI(params[key]);
      }).join('&');

      if(dummyMode){
        await setTimeout(1000);
        self.searchResults = searchResults.articles;
        self.isLoading = false;
        return
      }
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      let url = `${proxyUrl}http://newsapi.org/v2/everything?${queryString}`;
      let req = new Request(url);

      fetch(req)
        .then(async res => {
          let json = await res.json()

          if(json.status === 'ok'){
            self.searchResults = json.articles
          }
        })
        .catch(err => {
          console.log(err)
        })
        .finally(() => (self.isLoading = false))
    }
  }
};
</script>