import type { Component } from "vue";
import router from "@/router/router";
import { getAuthData, saveAuthData, logout } from "@/services/authService";
import ChangePassword from "@/components/ChangePassword.vue";

import {
  KeyOutline as KeyIcon,
  LogOutOutline as LogoutIcon,
  PersonCircleOutline as UserIcon,
} from "@vicons/ionicons5";
import { NIcon, useMessage } from "naive-ui";
import { defineComponent, h, ref } from "vue";

function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon),
    });
  };
}

export default defineComponent({
  components: { ChangePassword },
  emits: ["logout"],
  setup(_, { emit }) {
    const message = useMessage();
    const auth = getAuthData();

    // ❌ Tidak login
    if (!auth?.token) {
      logout();
      return;
    }

    const employee = auth.employee;
    const welcomeName = employee?.personName;
    const showChangePassword = ref(false);

    const handleSelect = (key: string) => {
      switch (key) {
        case "profile":
          //message.info('Go to profile')
          router.push("/Profile");
          break;
        case "editProfile":
          message.info("Edit your profile");
          break;
        case "changePassword":
          showChangePassword.value = true;
          break;
        case "logout":
          emit("logout");
          break;
      }
    };
    return {
      showChangePassword,
      options: [
        {
          label: "Profile",
          key: "profile",
          icon: renderIcon(UserIcon),
        },
        {
          type: "divider",
        },
        {
          label: "Ubah Password",
          key: "changePassword",
          icon: renderIcon(KeyIcon),
        },
        {
          type: "divider",
        },
        {
          label: "Logout",
          key: "logout",
          icon: renderIcon(LogoutIcon),
        },
      ],
      handleSelect,
      welcomeName,
    };
  },
});
