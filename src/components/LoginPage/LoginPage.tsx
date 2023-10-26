import React, { useState } from "react";
import naverLogo from "../../asset/buttonImages/naverlogin.png";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../api/axiosInstance";
import * as ST from "./STLoginPage";
import { useRecoilState } from "recoil";
import { userState } from "../../recoil/atoms/UserState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { validateEmail, validateLoginPassword } from "../../util/validation";
import { setTokens } from "../../util/token";
import { Button } from "../../components/common/Button";
import toast, { Toaster } from "react-hot-toast";
import { useLanguage } from "../../util/Locales/useLanguage";
import jwtDecode from "jwt-decode";

interface DecodedToken {
  sub: number;
}
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLang, t, changeLanguage } = useLanguage();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  const [, setUser] = useRecoilState(userState);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEmail(newValue);
    setEmailError(t(validateEmail(newValue)));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPassword(newValue);
    setPasswordError(t(validateLoginPassword(newValue)));
  };

  const handleLogin = async () => {
    setEmailError(validateEmail(email));
    setPasswordError(t(validateLoginPassword(password)));

    if (emailError || passwordError) {
      return;
    }
    try {
      const response = await axiosInstance.post(
        `/users/login`,
        {
          email: email,
          password: password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log("response.headers", response.headers);
      if (response.status === 200) {
        const accessToken = response.headers["accesstoken"];
        const refreshToken = response.headers["refreshtoken"];
        setTokens(accessToken, refreshToken);
        const userId = (jwtDecode(accessToken) as DecodedToken).sub;
        console.log("userId", userId);

        setUser({ userId });

        navigate("/");
        toast.success(t("환영합니다!"), {
          className: "toast-success toast-container",
        });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  };

  const kakaoLoginHandler = () => {
    const REACT_APP_URL = import.meta.env.VITE_REACT_APP_URL;
    // "https://www.totobon6125.store";
    const kakaoOauthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&redirect_uri=${encodeURIComponent(
      `${REACT_APP_URL}/users/login/kakao`
    )}&client_id=${import.meta.env.VITE_REACT_APP_KAKAO_CLIENT_ID}`;
    window.location.href = kakaoOauthURL;
  };

  const googleLoginHandler = () => {
    const REACT_APP_URL = import.meta.env.VITE_REACT_APP_URL;
    const googleOauthURL = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${
      import.meta.env.VITE_GOOGLE_CLIENT_ID
    }&scope=openid%20profile%20email&redirect_uri=${encodeURIComponent(
      `${REACT_APP_URL}/users/login/google`
    )}&access_type=offline`;
    window.location.href = googleOauthURL;
  };

  const naverLoginHandler = () => {
    const REACT_APP_URL = import.meta.env.VITE_REACT_APP_URL;
    const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
    const STATE = "false";
    const naverOauthURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&state=${STATE}&redirect_uri=${encodeURIComponent(
      `${REACT_APP_URL}/users/login/naver`
    )}`;

    window.location.href = naverOauthURL;
  };

  const handleJoinClick = () => {
    navigate("/join");
  };
  const goToMain = () => {
    navigate("/");
  };

  return (
    <ST.Container>
      <Toaster />
      <h1 onClick={goToMain}>{t("로그인")}</h1>
      <button onClick={changeLanguage}>
        {currentLang === "ko" ? "🇰🇷" : currentLang === "en" ? "🇺🇸" : "🇯🇵"}
      </button>
      {/* <img src="" alt="logo" onClick={goToMain}>로고</img> */}
      <ST.LabelWrapper>
        <label>{t("이메일")}</label>
        <ST.InputWithIcon>
          <ST.StyledInput
            type="email"
            value={email}
            onChange={handleEmailChange}
          />
          {email && (
            <ST.ClearIcon onClick={() => setEmail("")}>
              <FontAwesomeIcon
                icon={faCircleXmark}
                size="sm"
                style={{ color: "#9ca5b4" }}
              />
            </ST.ClearIcon>
          )}
        </ST.InputWithIcon>
        <ST.ErrorMessageLogin>{emailError}</ST.ErrorMessageLogin>
      </ST.LabelWrapper>
      <ST.LabelWrapper>
        <label>{t("비밀번호")}</label>
        <ST.InputWithIcon>
          <ST.StyledInput
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
          {password && (
            <ST.ClearIcon onClick={() => setPassword("")}>
              <FontAwesomeIcon
                icon={faCircleXmark}
                size="sm"
                style={{ color: "#9ca5b4" }}
              />
            </ST.ClearIcon>
          )}
        </ST.InputWithIcon>
        <ST.ErrorMessageLogin>{passwordError}</ST.ErrorMessageLogin>
      </ST.LabelWrapper>
      <Button onClick={handleLogin}>{t("로그인")}</Button>
      <div>
        <ST.KakaoButton onClick={kakaoLoginHandler}>
          <img
            src="https://developers.kakao.com/tool/resource/static/img/button/login/simple/ko/kakao_login_small.png"
            width="70"
          />
        </ST.KakaoButton>
      </div>
      <ST.GoogleLoginButton onClick={googleLoginHandler}>
        <ST.Icon
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google logo"
        />
        구글 로그인
      </ST.GoogleLoginButton>
      <ST.NaverLoginBtn
        onClick={naverLoginHandler}
        src={naverLogo}
        alt="naverlogin"
      ></ST.NaverLoginBtn>
      <ST.SignupText>
        {t("로컬밍글의 회원이 아니신가요?")}{" "}
        <span onClick={handleJoinClick}>{t("회원가입")}</span>
      </ST.SignupText>
    </ST.Container>
  );
};
export default LoginPage;
