import { ref, computed } from "vue";

const permissions = ref<string[]>([]);

export const setPermissions = (data: string[]) => {
  permissions.value = data;
};

export const can = (permission: string) => {
  return permissions.value.includes(permission);
};
