import React, { useState, useEffect } from "react";
import * as ST from "./STJoinPage";
import { Button } from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { userState } from "../../recoil/atoms/UserState";
import { axiosInstance } from "../../api/axiosInstance";
import {
  validateNickname,
  validatePassword,
  validatePasswordConfirmation,
  validateEmail,
  validateBio,
  handleCheckNickname,
  validateAuthCodeTimer,
  validateEmailVerification,
} from "../../util/validation";
import JSConfetti from "js-confetti";
import { useLanguage } from "../../util/Locales/useLanguage";
import { sendVerificationEmail, verifyEmailCode } from "../../api/api";

const SignUpForm: React.FC = () => {
  const { currentLang, t, changeLanguage } = useLanguage();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [, setUser] = useRecoilState(userState);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const jsConfetti = new JSConfetti();

  const [nicknameError, setNicknameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [bioError, setBioError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState<boolean | null>(null);
  const [authCode, setAuthCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const timerValidationMessage = validateAuthCodeTimer(isTimerExpired);
  const emailValidationMessage = validateEmailVerification(isEmailVerified);
  const [isNicknameValid, setIsNicknameValid] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignUp = async () => {
    const newNicknameError = t(validateNickname(nickname));
    const newEmailError = t(validateEmail(email));
    const newPasswordError = t(validatePassword(password));
    const newConfirmPasswordError = t(
      validatePasswordConfirmation(password, confirmPassword)
    );
    const newBioError = t(validateBio(bio));

    setNicknameError(newNicknameError);
    setEmailError(newEmailError);
    setPasswordError(newPasswordError);
    setConfirmPasswordError(newConfirmPasswordError);
    setBioError(newBioError);

    if (
      newNicknameError ||
      newEmailError ||
      newPasswordError ||
      newConfirmPasswordError ||
      newBioError
    ) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(`users/signup`, {
        nickname,
        email,
        password,
        confirmPassword,
        intro: bio,
      });

      if (response.status === 201) {
        setUser({
          userId: response.data.userId,
        });

        jsConfetti.addConfetti({
          confettiColors: [
            "#FFA7A7",
            "#FFCC67",
            "#FFFF9D",
            "#AEEA00",
            "#AEC6FF",
            "#D1B2FF",
          ],
          confettiRadius: 6,
          confettiNumber: 1000,
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.error("예상치 못한 응답:", response);
      }
      console.log("서버 응답:", response);
    } catch (error: unknown) {
      console.error("회원가입 중 에러 발생:", error);

      if (error && typeof error === "object" && "response" in error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.error("서버 응답:", (error as any).response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (emailSent) {
      setCountdown(10);
      timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown !== null) {
            if (prevCountdown === 0) {
              clearInterval(timer);
              setIsTimerExpired(true);
              setAuthError(t("인증 코드의 유효시간이 지났습니다."));
            }
            return prevCountdown - 1;
          }
          return null;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [emailSent]);

  const handleSendEmail = async () => {
    try {
      await sendVerificationEmail(email, "", "");
      setEmailSent(true);

      setIsTimerExpired(false);
    } catch (error) {
      console.error("이메일 보내기 실패:", error);
    }
  };

  const handleAuth = async () => {
    try {
      await verifyEmailCode(Number(authCode));
      setIsEmailVerified(true);
    } catch (error) {
      console.error("인증 실패:", error);
      setAuthError(t("인증코드를 다시 확인해주세요."));
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNickname(newValue);
    setNicknameError(t(validateNickname(newValue)));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEmail(newValue);

    const errorMessage = t(validateEmail(newValue));
    setEmailError(errorMessage);

    if (errorMessage) {
      setIsEmailValid(false);
    } else {
      setIsEmailValid(true);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPassword(newValue);
    setPasswordError(t(validatePassword(newValue)));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setConfirmPassword(newValue);
    setConfirmPasswordError(
      t(validatePasswordConfirmation(password, newValue))
    );
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setBio(newValue);
    setBioError(t(validateBio(newValue)));
  };

  const handleNicknameDupCheck = async () => {
    const errorMessage = t(await handleCheckNickname(nickname));
    setNicknameError(errorMessage);

    if (errorMessage === t("닉네임을 사용할 수 있습니다.")) {
      setIsNicknameValid(true);
    } else {
      setIsNicknameValid(false);
    }
  };

  const handleEmailDupCheck = async () => {
    const errorMessage = t(await handleCheckEmail(email));
    setEmailError(errorMessage);
    setIsEmailValid(errorMessage === t("이메일을 사용할 수 있습니다."));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const goToMain = () => {
    navigate("/");
  };
  return (
    <ST.Wrapper>
      <div onClick={goToMain}>{t("회원가입")}</div>
      <button onClick={changeLanguage}>
        {currentLang === "ko" ? "🇰🇷" : currentLang === "en" ? "🇺🇸" : "🇯🇵"}
      </button>
      {/* <img src="" alt="logo" onClick={goToMain}>로고</img> */}
      <ST.LabelWrapper>
        <label>{t("닉네임")}</label>
        <div>
          <input type="text" value={nickname} onChange={handleNicknameChange} />
          <ST.DupCheckButtonWrap>
            <ST.DupCheckButton onClick={handleNicknameDupCheck}>
              {t("중복 체크")}
            </ST.DupCheckButton>
          </ST.DupCheckButtonWrap>
        </div>
        <ST.ValidationColor
          isValid={
            isNicknameValid === null
              ? null
              : isNicknameValid ||
                nicknameError === "닉네임을 사용할 수 있습니다."
          }
        >
          {nicknameError}
        </ST.ValidationColor>
        {countdown !== null && (
          <span>
            {t("남은 시간:")} {Math.floor(countdown / 60)} {t("분")}{" "}
            {countdown % 60} {t("초")}
          </span>
        )}
      </ST.LabelWrapper>

      <ST.LabelWrapper>
        <label>{t("이메일")}</label>
        <div>
          <input type="email" value={email} onChange={handleEmailChange} />
          {emailSent ? (
            <>
              <input
                type="text"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder={t("인증코드")}
              />
              <button onClick={handleAuth}>{t("인증")}</button>
            </>
          ) : (
            <>
              <ST.DupCheckButtonWrap>
                <ST.DupCheckButton
                  onClick={handleSendEmail}
                  disabled={!isEmailValid}
                >
                  {t("인증코드 보내기")}
                </ST.DupCheckButton>
              </ST.DupCheckButtonWrap>
              <ST.DupCheckButtonWrap>
                <ST.DupCheckButton
                  onClick={handleEmailDupCheck}
                  disabled={!isEmailValid}
                >
                  {t("중복 체크")}
                </ST.DupCheckButton>
              </ST.DupCheckButtonWrap>
            </>
          )}
        </div>
        <ST.ValidationColor isValid={isEmailValid}>
          {emailError}
        </ST.ValidationColor>
        {authError && <ST.ErrorMessageJoin>{authError}</ST.ErrorMessageJoin>}
      </ST.LabelWrapper>
      <ST.LabelWrapper>
        <label>{t("비밀번호")}</label>
        <ST.EyleToggleWrap>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
          />
          <ST.EyeToggleButton onClick={togglePasswordVisibility}>
            {showPassword ? (
              <FontAwesomeIcon icon={faEye} />
            ) : (
              <FontAwesomeIcon icon={faEyeSlash} />
            )}
          </ST.EyeToggleButton>
        </ST.EyleToggleWrap>
        <ST.ErrorMessageJoin>{passwordError}</ST.ErrorMessageJoin>
      </ST.LabelWrapper>

      <ST.LabelWrapper>
        <label>{t("비밀번호 확인")}</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
        />
        <ST.ErrorMessageJoin>{confirmPasswordError}</ST.ErrorMessageJoin>
      </ST.LabelWrapper>
      <ST.LabelWrapper>
        <label>{t("한줄 자기소개")}</label>
        <input type="text" value={bio} onChange={handleBioChange} />
        <ST.ErrorMessageJoin>{bioError}</ST.ErrorMessageJoin>
      </ST.LabelWrapper>
      {isLoading && <div>{t("회원가입 중...")}</div>}
      <Button onClick={handleSignUp}>{t("회원가입")}</Button>
    </ST.Wrapper>
  );
};

export default SignUpForm;
