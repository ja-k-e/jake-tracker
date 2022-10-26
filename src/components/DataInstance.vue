<template>
  <div class="main">
    <div class="charts">
      <DataInfo :group="groups.hours" :keys="groupsKeys.hours" type="hours" />
      <DataInfo :group="groups.weeks" :keys="groupsKeys.weeks" type="weeks" />
      <DataInfo
        :group="groups.months"
        :keys="groupsKeys.months"
        type="months"
      />
    </div>
    <div class="stats" v-if="stats.first">
      <ul>
        <li>
          {{ stats.first.ago.days }} days of {{ icon }} (est.
          {{ stats.first.date }})
        </li>
        <li>Last {{ icon }} {{ stats.last.date }} {{ stats.last.time }}</li>
        <li>
          {{ stats.total }} &times; {{ icon }} ({{
            (stats.total / stats.first.ago.days).toFixed(3)
          }}
          per day)
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import DataInfo from '@/components/DataInfo.vue';
import Time from '@/classes/Time';
import { FormattedInstance } from '@/App.vue';

interface Marker {
  left: string;
  label: string;
}

export interface Group {
  [k: string]: {
    count: number;
    value: number;
    year?: number;
    average?: number;
    divisible?: number;
  };
}

export type InstanceValue = number;

@Component({ components: { DataInfo } })
export default class DataInstance extends Vue {
  @Prop() private icon!: string;
  @Prop({ required: true }) private items!: Array<FormattedInstance>;

  active: null | number = null;

  get sortedByTime() {
    return Array.from(this.items).sort(
      (a: FormattedInstance, b: FormattedInstance) => {
        if (a.epoch > b.epoch) return -1;
        if (a.epoch < b.epoch) return 1;
        return 0;
      }
    );
  }

  get stats() {
    const len = this.sortedByTime.length;
    const first = this.sortedByTime[len - 1];
    const last = this.sortedByTime[0];
    return {
      first,
      last,
      total: len,
    };
  }

  get groupsKeys() {
    const clone: { [k: string]: string[] | Group } = { ...this.groups };
    for (const key in clone) {
      clone[key] = Object.keys(clone[key]).sort();
    }
    return clone;
  }

  get groups() {
    const weeks: Group = {};
    const months: Group = {};
    const hours: Group = {};
    this.sortedByTime.forEach(({ info }) => {
      const weekId = `${info.year}-${info.week.toString().padStart(2, '0')}`;
      const monthId = `${info.year}-${info.month.toString().padStart(2, '0')}`;
      const hourId = info.hour.toString().padStart(2, '0');
      if (!weeks[weekId])
        weeks[weekId] = {
          count: 0,
          value: info.week,
          year: info.year,
          average: 0,
          divisible: 7,
        };
      weeks[weekId].count++;
      if (!months[monthId])
        months[monthId] = {
          count: 0,
          value: info.month,
          year: info.year,
          average: 0,
          divisible: info.daysInMonth,
        };
      months[monthId].count++;
      if (!hours[hourId]) hours[hourId] = { count: 0, value: info.hour };
      hours[hourId].count++;
    });
    Object.keys(weeks).forEach(week => {
      weeks[week].average = weeks[week].count / (weeks[week].divisible || 1);
    });
    Object.keys(months).forEach(month => {
      months[month].average =
        months[month].count / (months[month].divisible || 1);
    });
    return { hours, weeks, months };
  }

  activate(epoch: number) {
    if (this.active === epoch) this.active = null;
    else this.active = epoch;
  }
  itemStyle({ dayPosition, weekPosition }: Time) {
    const top = `${(1 - dayPosition) * 100}%`;
    const left = `${weekPosition * 100 + 14.2857143 / 2}%`;
    return { top, left };
  }
}
</script>

<style scoped>
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chart {
  flex: 1;
  position: relative;
  margin-bottom: 2rem;
}

.charts > * + * {
  margin-top: 2rem;
}
.stats {
  margin-top: auto;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  margin-bottom: 2rem;
}
</style>
