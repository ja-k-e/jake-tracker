<template>
  <div class="self">
    <div v-if="type === 'hours'">
      Hour of the day
    </div>
    <div v-else-if="type === 'weeks'">
      Daily Avg by Week
    </div>
    <div v-else-if="type === 'months'">
      Daily Avg by Month
    </div>

    <div class="chart">
      <div v-for="(key, i) in truncatedKeys" :key="key" class="item">
        <span
          class="value"
          :style="{ height: (group[key][value] / max) * 100 + '%' }"
          ><span>{{ formatValue(group[key][value]) }}</span></span
        >
        <span class="label" v-if="i % 2 === 0">{{ group[key].value }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Group } from '@/components/DataInstance.vue';

@Component
export default class DataInfo extends Vue {
  @Prop() private group!: Group;
  @Prop() private keys!: string[];
  @Prop() private type!: 'hours' | 'weeks' | 'months';

  get value() {
    return this.group[this.keys[0]].average ? 'average' : 'count';
  }

  get max() {
    return this.keys.reduce(
      (prev, next) => Math.max(this.group[next][this.value] || 0, prev),
      0
    );
  }

  get truncatedKeys() {
    const max = 36;
    if (this.keys.length < max) return this.keys;
    return Array.from(this.keys).splice(
      this.keys.length - max,
      this.keys.length
    );
  }

  formattedHour(hour: number) {
    const date = new Date(0, 0, 0, hour);
    const h = (date.getHours() + 24) % 12 || 12;
    return h + (hour < 12 ? ' AM' : ' PM');
  }

  formatValue(value: number) {
    return this.value === 'average' ? value.toFixed(3) : value;
  }
}
</script>

<style scoped>
.chart {
  border-bottom: 2px solid white;
  display: flex;
  height: 90px;
  margin-top: 30px;
  position: relative;
}
.chart .item {
  height: 100%;
  flex: 1;
  font-size: 0.4rem;
  position: relative;
}
.chart .item + .item {
  margin-left: 2px;
}

.chart .item .value::after {
  border-right: 2px solid white;
  bottom: 0;
  content: '';
  left: calc(50% - 1px);
  position: absolute;
  top: 0;
}
.chart .item .value {
  /* background: white; */
  bottom: 0;
  display: block;
  position: absolute;
  width: 100%;
}
.chart .item .label {
  top: calc(100% + 2px);
  display: block;
  position: absolute;
  width: 100%;
}
.chart .item .value span {
  bottom: 100%;
  left: 50%;
  position: absolute;
  text-align: center;
  transform: rotate(-90deg) translateX(-50%) translateY(-50%);
  transform-origin: 0 0;
  width: 100%;
}
</style>
