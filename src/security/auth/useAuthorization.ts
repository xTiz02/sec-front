import { useNavigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  type SecurityProfileResponse,
  authCheckSuccess,
} from "../slice/authSlice";
import {
  LOGIN_ENDPOINT,
  SELF_ENDPOINT,
} from "../../routes/endpoints";
import { setCookie } from "@/utils/cookieUtils";


const encodeFormData = (data: Record<string, string>) =>
  Object.keys(data)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join("&")

export const useAuthorization = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAppSelector((state) => state.auth);

  const processLogin = async (username: string, password: string) => {
    const payload = {
      username,
      password,
    };
     try {
      const response = await fetch(`${LOGIN_ENDPOINT}`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encodeFormData(payload),
      });

      // save token in cookies
      const access = await response.json();
      console.log("Login response:", access);
      const { token: accessToken } = access;
      setCookie("access_token", accessToken);

      // get user after authentication
      const userResponse = await fetch(SELF_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (userResponse.ok) {
        const data = await userResponse.json();
        dispatch(authCheckSuccess(data));

        const redirectPath = sessionStorage.getItem("redirect_after_login");
        sessionStorage.removeItem("redirect_after_login");
        navigate(redirectPath || "/", { replace: true });
      }
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  const redirectToNewAuthentication = async () => {
    navigate("/login", { replace: true });
  };

  const hasViewAuthorization = ({
    path,
    securityProfileSet,
  }: {
    path: string;
    securityProfileSet: SecurityProfileResponse[];
  }): boolean => {
    if (path === "/") {
      return true;
    }

    if (!securityProfileSet) {
      return false;
    }

    return securityProfileSet.some((profile) =>
      profile.viewAuthorizationList.some(({ view }) =>
        new RegExp(`^${view.route}$`).test(path),
      ),
    );
  };

  const verifyAuthorization = async () => {
    let data;

    if (!user) {
      try {
        const response = await fetch(SELF_ENDPOINT, { credentials: "include" });

        if (!response.ok) {
          redirectToNewAuthentication();
          return false;
        }

        data = await response.json();
        dispatch(authCheckSuccess(data));
      } catch (e) {
        console.error("Error fetching user: ", e);
        return false;
      }
    }

    const profileSet = data?.securityProfileSet ?? user?.securityProfileSet;

    if (
      !hasViewAuthorization({
        path: location.pathname,
        securityProfileSet: profileSet,
      })
    ) {
      navigate("/", { replace: true });
      return false;
    }

    return true;
  };

  return { verifyAuthorization, hasViewAuthorization, processLogin };
};
