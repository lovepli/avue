import { setPx } from 'utils/util'
import echartList from './list'
export default (() => {
  return {
    props: {
      click: Function,
      dataFormatter: Function,
      titleFormatter: Function,
      clickFormatter: Function,
      formatter: Function,
      width: {
        type: Number,
        default: 600
      },
      height: {
        type: Number,
        default: 600
      },
      animation: {
        type: Boolean,
        default: true
      },
      child: {
        type: Object,
        default: () => {
          return {}
        }
      },
      time: {
        type: Number,
        default: 0,
      },
      url: {
        type: String,
      },
      disabled: {
        type: Boolean,
        default: true
      },
      dataType: {
        type: Number,
        default: 0,
      },
      dataQuery: {
        type: Object,
        default: () => {
          return {}
        },
      },
      homeUrl: {
        type: String,
      },
      dataMethod: {
        type: String,
        default: 'get',
      },
      id: {
        type: String,
        default: 'main_' + new Date()
      },
      data: {
        type: [Object, String, Array]
      },
      component: {
        type: Object,
        default: () => {
          return {};
        }
      },
      option: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data() {
      return {
        headerHeight: '',
        checkChart: '',
        myChart: "",
        dataChart: '',
        dataUrl: '',
        key: false,
        isChart: true,
      };
    },
    watch: {
      url: {
        handler(val) {
          this.dataUrl = val || '';
        },
        deep: true,
        immediate: true
      },
      data: {
        handler() {
          this.updateData();
        },
        deep: true,
        immediate: true
      },
      width() {
        this.updateData();
      },
      height() {
        this.updateData();
      },
      option: {
        handler() {
          if (this.myChart && this.isChart) {
            this.updateData();
          }
        },
        deep: true,
        immediate: true
      }
    },
    computed: {
      dataChartLen() {
        return (this.dataChart || []).length
      },
      name() {
        return this.$el.className.replace('avue-echart-', '').replace('avue-echart', '').replace(' ', '');
      },
      isApi() {
        return this.dataType === 1;
      },
      style() {
        return this.component.style || {}
      },
      styleChartName() {
        const obj = {
          width: setPx(this.width),
          height: setPx(this.height)
        };
        return obj
      },
      styleSizeName() {
        return {
          width: setPx((this.width)),
          height: setPx((this.height))
        };
      }
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        if (this.$refs[this.id]) {
          if (echartList.includes(this.name)) {
            this.isChart = true;
          } else {
            this.isChart = false;
          }

          if (this.isChart) {
            this.myChart = window.echarts.init(this.$refs[this.id]);
          }
        }
      },
      updateUrl(url) {
        this.dataUrl = url
        this.updateData();
      },
      updateData() {
        this.resetData && this.resetData();
        if (this.key) return
        this.key = true;
        const callback = () => {
          this.key = false;
          if (this.isApi) {
            let dataUrl = this.dataUrl.replace('${HOME_URL}', this.homeUrl);
            const detail = (res) => {
              const data = typeof (this.dataFormatter) === 'function' ? this.dataFormatter(res.data) : res.data
              this.dataChart = data.data || {};
              if (this.isChart && this.myChart) {
                this.myChart.clear();
                this.updateChart();
              }
            }
            if (this.dataMethod === 'get') {
              this.$httpajax.get(dataUrl, {
                params: this.dataQuery
              }).then(res => {
                detail(res);
              })
            } else if (this.dataMethod === 'post') {
              let params = {};
              let url = dataUrl;
              if (url.includes("?")) {
                const index = url.indexOf("?");
                url = url.substr(index + 1);
                let list = url.split('&');
                list.forEach(ele => {
                  let dic = ele.split('=');
                  let label = dic[0];
                  let value = dic[1];
                  params[label] = value;
                })
              }
              this.$httpajax.post(dataUrl, Object.assign(this.dataQuery, params)).then(res => {
                detail(res);
              })
            }
          } else {
            this.dataChart = this.data || {};
            if (this.isChart && this.myChart) {
              this.myChart.clear();
              this.updateChart();
            }
          }
        }
        this.$nextTick(() => {
          callback();
          clearInterval(this.checkChart);
          if (this.time !== 0 && this.disabled) {
            this.checkChart = setInterval(() => {
              callback();
            }, this.time);
          }
        })
      },
    }
  }
})()