<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Shield,
  Lock,
  Plus,
  Search,
  MoreHorizontal,
  Database,
  Check,
  Crown,
  Server,
} from "lucide-vue-next";

// Mock Users
const users = ref([
  {
    username: "root",
    host: "localhost",
    global_admin: true,
    active: true,
    plugins: "mysql_native_password",
  },
  {
    username: "admin",
    host: "%",
    global_admin: true,
    active: true,
    plugins: "caching_sha2_password",
  },
  {
    username: "app_user",
    host: "192.168.1.%",
    global_admin: false,
    active: true,
    plugins: "caching_sha2_password",
  },
  {
    username: "readonly",
    host: "%",
    global_admin: false,
    active: false,
    plugins: "mysql_native_password",
  },
  {
    username: "backup_svc",
    host: "localhost",
    global_admin: false,
    active: true,
    plugins: "sha256_password",
  },
]);

const searchQuery = ref("");
const selectedUser = ref<any>(null); // If set, show matrix modal

// Privilege Matrix Mock Data
const dbObjects = ["draw_db", "sales_db", "logs_db"];
const privTypes = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "CREATE",
  "DROP",
  "ALTER",
  "INDEX",
  "EXECUTE",
];
const userPrivileges = ref<Record<string, Record<string, boolean>>>({
  draw_db: { SELECT: true, INSERT: true, UPDATE: true, DELETE: false },
  sales_db: { SELECT: true, INSERT: false, UPDATE: false, DELETE: false },
});

const togglePrivilege = (db: string, priv: string) => {
  if (!userPrivileges.value[db]) userPrivileges.value[db] = {};
  userPrivileges.value[db][priv] = !userPrivileges.value[db][priv];
};

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter((u) => u.username.includes(searchQuery.value));
});

// Helper for Matrix Grid
const isGranted = (db: string, priv: string) => {
  return userPrivileges.value[db] && userPrivileges.value[db][priv];
};
</script>

<template>
  <div class="h-full flex flex-col bg-gray-50 overflow-hidden relative">
    <!-- HEADER -->
    <div
      class="px-8 py-5 flex justify-between items-center bg-white border-b border-gray-200 shrink-0"
    >
      <div>
        <h1
          class="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2"
        >
          <Shield class="w-6 h-6 text-blue-600" /> User Management
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Manage access control and server privileges.
        </p>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative">
          <Search
            class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search user..."
            class="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
        >
          <Plus class="w-4 h-4" /> Add User
        </button>
      </div>
    </div>

    <!-- MAIN CONTENT: USER CARDS -->
    <div class="flex-1 overflow-y-auto p-8">
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="user in filteredUsers"
          :key="user.username"
          @click="selectedUser = user"
          class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
        >
          <!-- Status Indicator Strip -->
          <div
            class="absolute left-0 top-0 bottom-0 w-1"
            :class="user.active ? 'bg-green-500' : 'bg-gray-300'"
          ></div>

          <div class="flex justify-between items-start mb-4 pl-2">
            <div class="relative">
              <div
                class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 border border-gray-100 uppercase"
              >
                {{ user.username.substring(0, 2) }}
              </div>
              <div
                v-if="user.global_admin"
                class="absolute -top-1 -right-1 bg-amber-100 text-amber-600 p-0.5 rounded-full border border-white shadow-sm"
                title="Global Admin"
              >
                <Crown class="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
            <button
              class="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal class="w-5 h-5" />
            </button>
          </div>

          <div class="pl-2">
            <h3 class="font-bold text-gray-800 text-lg">{{ user.username }}</h3>
            <div
              class="flex items-center gap-2 text-xs text-gray-500 font-mono mt-0.5"
            >
              <span class="bg-gray-100 px-1.5 py-0.5 rounded"
                >@{{ user.host }}</span
              >
              <span>• {{ user.plugins }}</span>
            </div>
          </div>

          <div class="mt-4 pl-2 flex items-center gap-2">
            <span
              v-if="user.active"
              class="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100 flex items-center gap-1"
            >
              <Check class="w-3 h-3" /> Active
            </span>
            <span
              v-else
              class="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full border border-gray-200 flex items-center gap-1"
            >
              <Lock class="w-3 h-3" /> Locked
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- MATRIX MODAL (Overlay) -->
    <div
      v-if="selectedUser"
      class="absolute inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center transition-all animate-in fade-in duration-200"
    >
      <div
        class="bg-white w-[90%] h-[90%] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <!-- Modal Header -->
        <div
          class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase"
            >
              {{ selectedUser.username.substring(0, 2) }}
            </div>
            <div>
              <h2
                class="text-lg font-bold text-gray-800 flex items-center gap-2"
              >
                Privilege Matrix:
                <span class="text-blue-600">{{ selectedUser.username }}</span>
                <span
                  class="text-xs font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full"
                  >@{{ selectedUser.host }}</span
                >
              </h2>
              <p class="text-xs text-gray-500">
                Configure database-specific permissions
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="selectedUser = null"
              class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              @click="selectedUser = null"
              class="px-4 py-2 text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>

        <!-- Matrix Grid -->
        <div class="flex-1 overflow-auto bg-white p-6">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th
                  class="text-left py-3 px-4 w-48 bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10 font-bold text-gray-600 uppercase text-xs tracking-wider"
                >
                  Database / Object
                </th>
                <th
                  v-for="priv in privTypes"
                  :key="priv"
                  class="text-center py-3 px-2 w-24 bg-gray-50 border-b-2 border-gray-200 sticky top-0 z-10 font-bold text-gray-500 text-[10px] uppercase"
                >
                  <div
                    class="-rotate-45 transform origin-bottom-left inline-block mb-1"
                  >
                    {{ priv }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <!-- Global Server Row -->
              <tr class="bg-amber-50/30">
                <td
                  class="py-3 px-4 font-bold text-amber-700 border-r border-gray-100 flex items-center gap-2"
                >
                  <Server class="w-4 h-4" />
                  <span>SERVER GLOBAL</span>
                </td>
                <td
                  v-for="priv in privTypes"
                  :key="priv"
                  class="text-center border-r border-gray-100 bg-amber-50/10"
                >
                  <!-- Disable granular perms for server level for now or specific -->
                  <input
                    type="checkbox"
                    disabled
                    class="rounded border-amber-300 text-amber-600 opacity-50"
                  />
                </td>
              </tr>

              <!-- DB Rows -->
              <tr
                v-for="db in dbObjects"
                :key="db"
                class="hover:bg-blue-50/50 transition-colors"
              >
                <td
                  class="py-3 px-4 font-medium text-gray-700 border-r border-gray-100 flex items-center gap-2"
                >
                  <Database class="w-4 h-4 text-blue-400" />
                  {{ db }}
                </td>
                <td
                  v-for="priv in privTypes"
                  :key="priv"
                  class="text-center border-r border-gray-100 relative group cursor-pointer"
                  @click="togglePrivilege(db, priv)"
                >
                  <div
                    v-if="isGranted(db, priv)"
                    class="w-full h-full absolute inset-0 bg-blue-100/50 z-0 transition-all"
                  ></div>
                  <div class="relative z-10">
                    <div
                      class="w-5 h-5 mx-auto rounded border flex items-center justify-center transition-all"
                      :class="
                        isGranted(db, priv)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-transparent group-hover:border-blue-400'
                      "
                    >
                      <Check class="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 class="font-bold text-gray-700 text-sm mb-2">Legend & Info</h4>
            <p class="text-xs text-gray-500">
              Clicking a cell toggles the privilege. Grantees will require a
              connection flush (`FLUSH PRIVILEGES`) which happens automatically
              upon Save.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
