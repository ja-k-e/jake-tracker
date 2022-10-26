<template>
  <div id="app">
    <router-view
      v-if="authenticated"
      :instances="formattedInstances"
      :multiples="formattedMultiples"
    />
    <Login :login="authenticate" v-else />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Firebase, { FirebaseValue } from '@/classes/Firebase';
import Time from '@/classes/Time';
import Login from '@/components/Login.vue';
import { MultipleValue } from '@/components/DataMultiple.vue';
import { InstanceValue } from '@/components/DataInstance.vue';
import { ActivityItem } from '@/constants/activities';

export interface FormattedMultiple {
  value: FirebaseValue;
  type: ActivityItem['type'];
  id: ActivityItem['id'];
  time: Time;
}
export type FormattedInstance = Time;

export type StoreInstance = 'poops';
export type StoreMultiple = 'workout';

const storeInstances: Array<StoreInstance> = ['poops'];
const storeMultiples: Array<StoreMultiple> = ['workout'];

export type FormatStoreInstance = {
  [K in StoreInstance]?: Array<FormattedInstance>;
};
export type FormatStoreMultiple = {
  [K in StoreMultiple]?: Array<FormattedMultiple>;
};
type StoresInstance = { [K in StoreInstance]?: Array<InstanceValue> };
type StoresMultiple = { [K in StoreMultiple]?: Array<MultipleValue> };

@Component({ components: { Login } })
export default class App extends Vue {
  authenticated = false;
  email?: string;
  firebase: Firebase = new Firebase();
  id?: string;
  storesInstance: StoresInstance = {};
  storesMultiple: StoresMultiple = {};

  constructor() {
    super();
    storeInstances.forEach(
      (instance: StoreInstance) => (this.storesInstance[instance] = [])
    );
    storeMultiples.forEach(
      (multiple: StoreMultiple) => (this.storesMultiple[multiple] = [])
    );
  }

  get formattedInstances(): FormatStoreInstance {
    const res: FormatStoreInstance = {};
    for (const k in this.storesInstance) {
      res[k as StoreInstance] = Array.from(
        this.storesInstance[k as StoreInstance] || []
      )
        .sort()
        .reverse()
        .map(instance => this.formatInstance(instance));
    }
    return res;
  }
  get formattedMultiples(): FormatStoreMultiple {
    const res: FormatStoreMultiple = {};
    for (const k in this.storesMultiple) {
      res[k as StoreMultiple] = Array.from(
        this.storesMultiple[k as StoreMultiple] || []
      )
        .sort()
        .reverse()
        .map(([a, b, c, d]) =>
          this.formatMultiple(
            a as number,
            b as FirebaseValue,
            c as ActivityItem['type'],
            d as ActivityItem['id']
          )
        );
    }
    return res;
  }

  formatInstance(epoch: number) {
    return new Time(epoch as number) as FormattedInstance;
  }

  formatMultiple(
    epoch: number,
    value: FirebaseValue,
    type: ActivityItem['type'],
    id: ActivityItem['id']
  ) {
    return { time: new Time(epoch), value, type, id } as FormattedMultiple;
  }

  authenticate(email: string, password: string) {
    this.firebase
      .authenticate(email, password)
      .catch(this.handleUnauthenticated);
  }
  handleUnauthenticated() {
    this.authenticated = false;
  }
  initialize() {
    this.firebase.initialize((data: { email: string; uid: string }) => {
      // We're waiting for signed in. This is called multiple times.
      if (data) {
        this.email = data.email;
        this.id = data.uid;
        this.authenticated = true;
        this.initializeData();
      } else this.authenticated = false;
    });
  }
  initializeData() {
    storeInstances.forEach(instance => {
      this.firebase.subscribe(instance, {
        added: (k: string, v: InstanceValue) =>
          this.storesInstance[instance]?.push(v),
      });
    });
    storeMultiples.forEach(multiple => {
      this.firebase.subscribe(multiple, {
        added: (k: string, v: MultipleValue) =>
          this.storesMultiple[multiple]?.push(v),
      });
    });
  }

  mounted() {
    this.initialize();
  }
}
</script>

<style>
html,
body {
  margin: 0;
  height: 100%;
  text-align: center;
  background: #111;
}
section {
  display: flex;
  flex-direction: column;
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  box-sizing: border-box;
  padding: 1rem;
  background: #111;
  color: white;
}
a {
  text-decoration: none;
  color: #ffbb00;
  text-transform: uppercase;
  font-weight: bold;
}
*:focus {
  outline: 2px solid #ffbb00;
}
</style>
