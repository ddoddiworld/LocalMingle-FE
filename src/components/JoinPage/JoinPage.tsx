import React, { useState } from "react";
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
} from "../../util/validation";
import JSConfetti from "js-confetti";

const SignUpForm: React.FC = () => {
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

  const handleSignUp = async () => {
    const newNicknameError = validateNickname(nickname);
    const newEmailError = validateEmail(email);
    const newPasswordError = validatePassword(password);
    const newConfirmPasswordError = validatePasswordConfirmation(
      password,
      confirmPassword
    );
    const newBioError = validateBio(bio);

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
        bio,
      });

      if (response.status === 200 || response.status === 201) {
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

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setNickname(newValue);
    setNicknameError(validateNickname(newValue));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEmail(newValue);
    setEmailError(validateEmail(newValue));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setPassword(newValue);
    setPasswordError(validatePassword(newValue));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setConfirmPassword(newValue);
    setConfirmPasswordError(validatePasswordConfirmation(password, newValue));
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setBio(newValue);
    setBioError(validateBio(newValue));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const goToMain = () => {
    navigate("/");
  };
  return (
    <ST.Wrapper>
      <div style={{"marginBottom":"50px"}}>
        <svg
          onClick={goToMain}
          width="210"
          height="40"
          viewBox="0 0 139 23"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.1 18V3.4H4.84V13.72H11.44V18H0.1ZM19.0859 18.2C17.9793 18.2 17.0193 18.06 16.2059 17.78C15.3926 17.4867 14.7193 17.0867 14.1859 16.58C13.6659 16.0733 13.2793 15.4667 13.0259 14.76C12.7726 14.0533 12.6459 13.28 12.6459 12.44C12.6459 11.6133 12.7859 10.84 13.0659 10.12C13.3459 9.4 13.7526 8.78 14.2859 8.26C14.8326 7.74 15.5059 7.33333 16.3059 7.04C17.1193 6.73333 18.0459 6.58 19.0859 6.58C20.1659 6.58 21.1126 6.73333 21.9259 7.04C22.7526 7.33333 23.4326 7.74 23.9659 8.26C24.4993 8.78 24.8993 9.4 25.1659 10.12C25.4326 10.8267 25.5659 11.5867 25.5659 12.4C25.5659 13.2133 25.4259 13.98 25.1459 14.7C24.8659 15.4067 24.4526 16.02 23.9059 16.54C23.3593 17.0467 22.6793 17.4533 21.8659 17.76C21.0659 18.0533 20.1393 18.2 19.0859 18.2ZM19.1059 15C19.7993 15 20.2993 14.7733 20.6059 14.32C20.9126 13.8667 21.0659 13.2267 21.0659 12.4C21.0659 11.5333 20.9126 10.8733 20.6059 10.42C20.3126 9.95333 19.8126 9.72 19.1059 9.72C18.4259 9.72 17.9259 9.96 17.6059 10.44C17.2993 10.9067 17.1393 11.56 17.1259 12.4C17.1126 13.24 17.2593 13.8867 17.5659 14.34C17.8726 14.78 18.3859 15 19.1059 15ZM39.4438 10.68L35.0238 11.78C34.9438 11.1267 34.7838 10.62 34.5438 10.26C34.3171 9.9 33.9038 9.72 33.3038 9.72C32.6238 9.72 32.1371 9.94667 31.8438 10.4C31.5504 10.8533 31.3971 11.52 31.3838 12.4C31.3704 13.28 31.5038 13.9333 31.7838 14.36C32.0771 14.7867 32.5838 15 33.3038 15C33.8771 15 34.2838 14.8267 34.5238 14.48C34.7771 14.1333 34.9504 13.6667 35.0438 13.08L39.5038 13.9C39.2104 15.2467 38.5371 16.3 37.4838 17.06C36.4304 17.82 35.0371 18.2 33.3038 18.2C32.1971 18.2 31.2371 18.06 30.4238 17.78C29.6238 17.4867 28.9638 17.0867 28.4438 16.58C27.9238 16.0733 27.5371 15.4667 27.2838 14.76C27.0304 14.0533 26.9038 13.28 26.9038 12.44C26.9038 11.6133 27.0438 10.84 27.3238 10.12C27.6038 9.4 28.0171 8.78 28.5638 8.26C29.1104 7.74 29.7904 7.33333 30.6038 7.04C31.4304 6.73333 32.3838 6.58 33.4638 6.58C35.1838 6.58 36.5304 6.94667 37.5038 7.68C38.4904 8.4 39.1371 9.4 39.4438 10.68ZM43.6803 18.28C42.6003 18.28 41.7536 18.0333 41.1403 17.54C40.527 17.0333 40.2203 16.3533 40.2203 15.5C40.2203 14.82 40.3736 14.2933 40.6803 13.92C40.987 13.5333 41.367 13.1933 41.8203 12.9C42.247 12.6333 42.8136 12.4067 43.5203 12.22C44.227 12.0333 45.1003 11.82 46.1403 11.58C46.9003 11.4067 47.3736 11.2533 47.5603 11.12C47.747 10.9733 47.8403 10.7733 47.8403 10.52C47.8403 10.2533 47.7203 10.0333 47.4803 9.86C47.2403 9.68667 46.8603 9.6 46.3403 9.6C45.7936 9.6 45.307 9.75333 44.8803 10.06C44.4536 10.3667 44.1136 10.8467 43.8603 11.5L40.3803 9.88C40.9403 8.82667 41.747 8.01333 42.8003 7.44C43.8536 6.86667 45.0736 6.58 46.4603 6.58C48.247 6.58 49.587 6.96 50.4803 7.72C51.3736 8.46667 51.8203 9.48 51.8203 10.76V13.78C51.8203 14.2467 51.887 14.5867 52.0203 14.8C52.167 15.0133 52.407 15.12 52.7403 15.12C52.8736 15.12 52.9936 15.1133 53.1003 15.1C53.2203 15.0733 53.3336 15.04 53.4403 15V17.48C53.227 17.64 52.9003 17.8 52.4603 17.96C52.0336 18.12 51.547 18.2 51.0003 18.2C50.0403 18.2 49.2736 17.98 48.7003 17.54C48.127 17.0867 47.827 16.4 47.8003 15.48C47.507 16.3333 46.987 17.0133 46.2403 17.52C45.4936 18.0267 44.6403 18.28 43.6803 18.28ZM45.6003 15.42C46.0003 15.42 46.347 15.3467 46.6403 15.2C46.9336 15.0533 47.1736 14.8667 47.3603 14.64C47.547 14.4133 47.6803 14.1533 47.7603 13.86C47.8536 13.5533 47.9003 13.2533 47.9003 12.96V12.6C47.7936 12.7067 47.6203 12.8067 47.3803 12.9C47.1403 12.9933 46.807 13.0867 46.3803 13.18C45.6603 13.3267 45.147 13.5133 44.8403 13.74C44.547 13.9667 44.4003 14.2267 44.4003 14.52C44.4003 14.7867 44.4936 15.0067 44.6803 15.18C44.8803 15.34 45.187 15.42 45.6003 15.42ZM58.9094 2.08V18H54.6094V2.08H58.9094ZM85.9081 3.46C85.9081 2.7 86.1415 2.08667 86.6081 1.62C87.0748 1.14 87.7281 0.9 88.5681 0.9C89.3815 0.9 90.0081 1.14 90.4481 1.62C90.9015 2.08667 91.1281 2.7 91.1281 3.46C91.1281 4.18 90.8948 4.77333 90.4281 5.24C89.9748 5.70667 89.3481 5.94 88.5481 5.94C87.7081 5.94 87.0548 5.70667 86.5881 5.24C86.1348 4.77333 85.9081 4.18 85.9081 3.46ZM90.6881 6.8V18H86.3481V6.8H90.6881ZM92.7148 18V6.8H97.0148V9.56C97.3615 8.53333 97.8615 7.78 98.5148 7.3C99.1682 6.82 99.9415 6.58 100.835 6.58C102.075 6.58 103.022 6.96667 103.675 7.74C104.342 8.51333 104.675 9.56667 104.675 10.9V18H100.355V12.24C100.355 11.3467 100.235 10.72 99.9948 10.36C99.7548 10 99.3482 9.82 98.7748 9.82C98.1882 9.82 97.7482 10.06 97.4548 10.54C97.1748 11.0067 97.0348 11.7533 97.0348 12.78V18H92.7148ZM110.741 17.64C109.301 17.64 108.181 17.2 107.381 16.32C106.594 15.4267 106.201 14.1 106.201 12.34C106.201 11.4067 106.321 10.5867 106.561 9.88C106.814 9.16 107.147 8.56667 107.561 8.1C107.987 7.63333 108.481 7.28 109.041 7.04C109.614 6.8 110.214 6.68 110.841 6.68C111.747 6.68 112.474 6.86667 113.021 7.24C113.567 7.6 113.987 8.16667 114.281 8.94V6.8H118.581V16.38C118.581 17.42 118.427 18.3267 118.121 19.1C117.827 19.8867 117.407 20.5333 116.861 21.04C116.327 21.5467 115.681 21.92 114.921 22.16C114.161 22.4133 113.327 22.54 112.421 22.54C111.634 22.54 110.947 22.4933 110.361 22.4C109.787 22.32 109.267 22.1933 108.801 22.02C108.347 21.86 107.927 21.6533 107.541 21.4C107.167 21.16 106.794 20.8867 106.421 20.58L109.921 18C110.174 18.3467 110.461 18.6133 110.781 18.8C111.114 18.9867 111.547 19.08 112.081 19.08C112.774 19.08 113.314 18.8667 113.701 18.44C114.087 18.0267 114.281 17.4133 114.281 16.6V15.1C114.001 15.8467 113.587 16.46 113.041 16.94C112.507 17.4067 111.741 17.64 110.741 17.64ZM112.541 14.88C113.234 14.88 113.734 14.6533 114.041 14.2C114.347 13.7467 114.501 13.12 114.501 12.32C114.501 11.4667 114.347 10.8133 114.041 10.36C113.747 9.90667 113.247 9.68 112.541 9.68C111.861 9.68 111.361 9.91333 111.041 10.38C110.734 10.8333 110.574 11.48 110.561 12.32C110.547 13.1467 110.694 13.78 111.001 14.22C111.307 14.66 111.821 14.88 112.541 14.88ZM124.886 2.08V18H120.586V2.08H124.886ZM138.555 14.72C138.141 15.7467 137.448 16.5867 136.475 17.24C135.515 17.88 134.221 18.2 132.595 18.2C131.541 18.2 130.628 18.06 129.855 17.78C129.081 17.4867 128.441 17.0933 127.935 16.6C127.441 16.0933 127.068 15.4933 126.815 14.8C126.575 14.1067 126.455 13.36 126.455 12.56C126.455 11.72 126.595 10.94 126.875 10.22C127.155 9.48667 127.561 8.85333 128.095 8.32C128.628 7.77333 129.288 7.34667 130.075 7.04C130.875 6.73333 131.788 6.58 132.815 6.58C133.841 6.58 134.728 6.73333 135.475 7.04C136.235 7.33333 136.855 7.73333 137.335 8.24C137.828 8.73333 138.195 9.31333 138.435 9.98C138.675 10.6333 138.795 11.3133 138.795 12.02V13.1H130.575C130.628 13.78 130.835 14.28 131.195 14.6C131.568 14.92 132.095 15.08 132.775 15.08C133.308 15.08 133.721 14.9733 134.015 14.76C134.321 14.5333 134.568 14.18 134.755 13.7L138.555 14.72ZM132.675 9.44C132.088 9.44 131.615 9.60667 131.255 9.94C130.908 10.26 130.688 10.7267 130.595 11.34H134.615C134.588 10.7667 134.415 10.3067 134.095 9.96C133.775 9.61333 133.301 9.44 132.675 9.44Z"
            fill="black"
          />
          <path
            d="M77.4394 3.4H84.1794V18H79.7594V7.92L79.8194 5.82L79.3794 8.12L77.1794 18H72.9194L70.7594 8.14L70.2994 5.7L70.3794 7.92V18H65.9594V3.4H72.7794L74.9194 13.92L75.0794 15.16L75.2394 13.92L77.4394 3.4Z"
            fill="#71EBA5"
          />
        </svg>
      </div>
      {/* <img src="" alt="logo" onClick={goToMain}>로고</img> */}
      <ST.LabelWrapper>
        <label>닉네임</label>
        <ST.Input
          type="text"
          value={nickname}
          onChange={handleNicknameChange}
        />
      </ST.LabelWrapper>
      <ST.ErrorMessageJoin>{nicknameError}</ST.ErrorMessageJoin>
      <br />
      <ST.LabelWrapper>
        <label>이메일</label>
        <ST.Input type="email" value={email} onChange={handleEmailChange} />
      </ST.LabelWrapper>
      <ST.ErrorMessageJoin>{emailError}</ST.ErrorMessageJoin>
      <br />
      <ST.LabelWrapper>
        <label>비밀번호</label>
          <ST.Input
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
      </ST.LabelWrapper>
      <ST.ErrorMessageJoin>{passwordError}</ST.ErrorMessageJoin>
      <br />
      <ST.LabelWrapper>
        <label>비밀번호 확인</label>
        <ST.Input
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
        />
      </ST.LabelWrapper>
      <ST.ErrorMessageJoin>{confirmPasswordError}</ST.ErrorMessageJoin>
      <br />
      <ST.LabelWrapper>
        <label>한줄 자기 소개</label>
        <ST.Input type="text" value={bio} onChange={handleBioChange} />
      </ST.LabelWrapper>
      <ST.ErrorMessageJoin>{bioError}</ST.ErrorMessageJoin>
      {isLoading && <div>회원가입 중...</div>}
      <br />
      <Button onClick={handleSignUp}>회원가입</Button>
    </ST.Wrapper>
  );
};

export default SignUpForm;
