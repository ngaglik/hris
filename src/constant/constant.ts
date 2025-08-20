export const LAYOUT_ITEMS = [
		
	{
	  label: 'Coba',
	  key: '/Table',
	},
	{
	  label: 'Profile',
	  key: '/Profile',
	},
	{
	  label: 'Layanan',
	  key: '/selfservices',
	  	children: [	
	      {
	        label: 'STR/SIP',
	        key: '/legalregistrasion',
	      },
	      {
	        label: 'IKI',
	        key: '/individualperformanceindex',
	      },
	      {
	        label: 'Sertifikat',
	        key: '/certificate',
	      }
    	]
	},

	{
	  label: 'Administrator',
	  key: '/administrator',
	  	children: [	  	
	      {
			  label: 'Diklat',
			  key: '/profiledevelopment',
			  	children: [	  	
			      {
			        label: 'Pelatihan',
			        key: '/reporttraining',
			      },
			      {
			        label: 'Validasi Sertifikat',
			        key: '/validatecertificate',
			      },{
			        label: 'Report Pelatihan Pegawai',
			        key: '/reporttrainingemployee',
			      }
		    	]
			},
			{
			  label: 'Kepegawaian',
			  key: '/profilehumanresource',
			  	children: [	  	
			      {
			        label: 'Data Pegawai',
			        key: '/employee',
			      },
			      {
			        label: 'Validasi perubahan',
			        key: '/validateemployee',
			      },
			      {
			        label: 'Report STR Pegawai',
			        key: 'reportlegalregistration',
			      },
		    	]
			},
			{
			  label: 'Referensi',
			  key: '/references',
			  	children: [	  	
			      
			      {
			        label: 'Organisasi',
			        key: '/organization',
			      },
			      {
			        label: 'Jabatan Manajerial',
			        key: '/position',
			      },
			      {
			        label: 'Jabatan Profesi',
			        key: '/professional',
			      },
			      {
			        label: 'Status kepegawaian',
			        key: '/EmployeeCategory',
			      },
			      {
			        label: 'Lokasi',
			        key: 'location',
			      },
			      {
			        label: 'Pendidikan',
			        key: 'graduation',
			      },
			      {
			        label: 'Agama',
			        key: 'religion',
			      }
		    	]
		  
			}	     
    	]
	}
	
]
