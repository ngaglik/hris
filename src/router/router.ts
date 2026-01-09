import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/container/home/Home.vue'
import Attendance from '@/components/attendance/Attendance.vue'
import Employee from '@/components/references/Employee.vue'
import Location from '@/components/references/Location.vue'
import Organization from '@/components/references/Organization.vue'
import Professional from '@/components/references/Professional.vue'
import Graduation from '@/components/references/Graduation.vue'
import Religion from '@/components/references/Religion.vue'
import EmployeeCategory from '@/components/references/EmployeeCategory.vue'
import Position from '@/components/references/Position.vue'
import Profile from '@/components/profile/Profile.vue'
import UserProfile from '@/components/profile/UserProfile.vue'
import UnitProfile from '@/components/profile/UnitProfile.vue'
import Education from '@/components/profile/Education.vue'
import Family from '@/components/profile/Family.vue'
import ProfileBar from '@/components/ProfileBar.vue'
import Table from '@/components/Table.vue'
import selectTree from '@/container/selectTree/selectTree.vue'

const router = createRouter({
	// 4. Provide the history implementation to use. We are using the hash history for simplicity here.
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			component: Profile,
		},	
		{
			path: '/Attendance',
			component: Attendance,
		},	
		{
			path: '/Profile',
			component: Profile,
		},			
		{
			path: '/UserProfile',
			component: UserProfile,
		},		
		{
			path: '/UnitProfile',
			component: UnitProfile,
		},				
		{
			path: '/ProfileBar',
			component: ProfileBar,
		},		
		{
			path: '/Employee',
			component: Employee,
		},			
		{
			path: '/EmployeeCategory',
			component: EmployeeCategory,
		},	
		{
			path: '/Professional',
			component: Professional,
		},			
		{
			path: '/Organization',
			component: Organization,
		},	
		{
			path: '/Position',
			component: Position,
		},			
		{
			path: '/Graduation',
			component: Graduation,
		},				
		{
			path: '/Religion',
			component: Religion,
		},	
		{
			path: '/Location',
			component: Location,
		},		
		{
			path: '/Table',
			component: Table,
		},		
		{
			path: '/selectTree',
			component: selectTree,
		}
	],
})

export default router
