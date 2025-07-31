import type { Component } from 'vue'
import router from '@/router/router'

import {
  Pencil as EditIcon,
  LogOutOutline as LogoutIcon,
  PersonCircleOutline as UserIcon
} from '@vicons/ionicons5'
import { NIcon, useMessage } from 'naive-ui'
import { defineComponent, h } from 'vue'

function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    })
  }
}

export default defineComponent({
  emits: ['logout'],
  setup(_, { emit }) {
    const message = useMessage()

    const handleSelect = (key: string) => {
      switch (key) {
        case 'profile':
          //message.info('Go to profile')
          router.push('/Profile')
          break
        case 'editProfile':
          message.info('Edit your profile')
          break
        case 'logout':
          emit('logout')
          break
      }
    }
    return {
      options: [
        {
          label: 'Profile',
          key: 'profile',
          icon: renderIcon(UserIcon)
        },
        {
          label: 'Edit Profile',
          key: 'editProfile',
          icon: renderIcon(EditIcon)
        },
        {
          type: 'divider'
        },
        {
          label: 'Logout',
          key: 'logout',
          icon: renderIcon(LogoutIcon)
        }
      ],
      handleSelect
    }
  }
})