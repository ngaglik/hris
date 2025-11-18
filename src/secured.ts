import { Config } from '@/constant/config'
import { apiFetch } from "@/services/apiClient";

export const CheckBearerExpired = (resp:number) => {
      if(resp===401 || resp===403){
        localStorage.removeItem(Config.TokenName)
        //localStorage.removeItem(Config.TokenName).session
        console.warn('Token expired or unauthorized. Redirecting to login.')
        // Redirect ke halaman login
        window.location.href = '/'
        return;        
      }      
    }

export const fetchSecureData = async () => {
  try {
    const response = await apiFetch(Config.UrlBackend + "/api/auth/secure", {
      method: "GET"
    });

    if (!response.ok) return false;

    const data = await response.text();
    console.log("RESULT:", data);

    return true;

  } catch (e) {
    console.error(e);
    return false;
  }
};

// export const fetchSecureData = async () => {
//   const localData = JSON.parse(localStorage.getItem(Config.TokenName) || "{}");
//   const token = localData.token;
//   const session = localData.session; 
//   if (!token) {
//     console.error('No token found!');
//     return false;
//   }

//   try {
//     const response = await fetch(Config.UrlBackend+'/api/auth/secure', {
//       method: 'GET',
//       headers: {
//         Authorization: `Bearer ${token}`,
//         uSession: `${session}`,
//       },
//     });

//     // if (!response.ok) {
//     //   console.error('Failed to fetch secure data');
//     //   return false;
//     // }
//     if (response.status === 401 || response.status === 403) {
//         // Token sudah tidak valid atau expired
//         console.warn('Token expired or unauthorized. Redirecting to login.');
//         localStorage.removeItem(Config.TokenName );
//         //localStorage.removeItem(Config.SessionName );
//         // Redirect ke halaman login
//         window.location.href = '/';
//         return;
//     }

//     const data = await response.text();
//     console.log('Secured :', data);
//     return true;
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// };


export const checkLogin = async () => {
  try {
    const success = await fetchSecureData();
    console.log('Success value:', success);
    return success;
  } catch (error) {
    console.error('Error fetching secure data:', error);
    return false;
  }
};