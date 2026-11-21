import { createRouter, createWebHistory } from "vue-router";
import Home from "@/container/home/Home.vue";
import Attendance from "@/components/attendance/Attendance.vue";
import AttendanceReport from "@/components/administrator/AttendanceReport.vue";
import AbsenceVerification from "@/components/administrator/AbsenceVerification.vue";
import Person from "@/components/references/Person.vue";
import Employee from "@/components/references/Employee.vue";
import Location from "@/components/references/Location.vue";
import Organization from "@/components/references/Organization.vue";
import Professional from "@/components/references/Professional.vue";
import Graduation from "@/components/references/Graduation.vue";
import Religion from "@/components/references/Religion.vue";
import EmployeeCategory from "@/components/references/EmployeeCategory.vue";
import Position from "@/components/references/Position.vue";
import Profile from "@/components/profile/Profile.vue";
import UserProfile from "@/components/profile/UserProfile.vue";
import UnitProfile from "@/components/profile/UnitProfile.vue";
import Education from "@/components/profile/Education.vue";
import Family from "@/components/profile/Family.vue";
import ProfileBar from "@/components/ProfileBar.vue";
import Table from "@/components/Table.vue";
import selectTree from "@/container/selectTree/selectTree.vue";
import CertificateGeneratorPDF from "@/components/tools/CertificateGeneratorPDF.vue";
import EmployeeSummaryUnitCategory from "@/components/references/dashboard/EmployeeSummaryUnitCategory.vue";
import PerformanceIndividu from "@/components/performance/PerformanceIndividu.vue";
import DashboardPerformance from "@/components/performance/DashboardPerformance.vue";
import EntriKinerja from "@/components/performance/EntriKinerja.vue";
import RekapKinerja from "@/components/performance/RekapKinerja.vue";
import MasterIndikator from "@/components/performance/MasterIndikator.vue";
import MappingIndikator from "@/components/performance/MappingIndikator.vue";

const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Attendance,
    },
    {
      path: "/Attendance",
      component: Attendance,
    },
    {
      path: "/AttendanceReport",
      component: AttendanceReport,
    },
    {
      path: "/AbsenceVerification",
      component: AbsenceVerification,
    },
    {
      path: "/Profile",
      component: Profile,
    },
    {
      path: "/UserProfile",
      component: UserProfile,
    },
    {
      path: "/UnitProfile",
      component: UnitProfile,
    },
    {
      path: "/ProfileBar",
      component: ProfileBar,
    },
    {
      path: "/Person",
      component: Person,
    },
    {
      path: "/Employee",
      component: Employee,
    },
    {
      path: "/EmployeeCategory",
      component: EmployeeCategory,
    },
    {
      path: "/Professional",
      component: Professional,
    },
    {
      path: "/Organization",
      component: Organization,
    },
    {
      path: "/Position",
      component: Position,
    },
    {
      path: "/Graduation",
      component: Graduation,
    },
    {
      path: "/Religion",
      component: Religion,
    },
    {
      path: "/Location",
      component: Location,
    },
    {
      path: "/Table",
      component: Table,
    },
    {
      path: "/selectTree",
      component: selectTree,
    },

    {
      path: "/CertificateGeneratorPDF",
      component: CertificateGeneratorPDF,
    },

    {
      path: "/EmployeeSummaryUnitCategory",
      component: EmployeeSummaryUnitCategory,
    },
    {
      path: "/PerformanceIndividu",
      component: PerformanceIndividu,
    },
    {
      path: "/DashboardPerformance",
      component: DashboardPerformance,
    },
    {
      path: "/EntriKinerja",
      component: EntriKinerja,
    },
    {
      path: "/RekapKinerja",
      component: RekapKinerja,
    },
    {
      path: "/MasterIndikator",
      component: MasterIndikator,
    },
    {
      path: "/MappingIndikator",
      component: MappingIndikator,
    },
  ],
});

export default router;
