import React, { useState, useEffect, useRef } from "react";
import * as St from "./STDeleteUser";
import { deleteUser } from "../../../api/api";
import lottie from "lottie-web";
import { useNavigate } from "react-router-dom";
import { Button } from "../../common/Button";
import { validateLoginPassword } from "../../../util/validation";
import toast from "react-hot-toast";
import { AnimationItem } from "lottie-web";

const DeleteUser: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const lottieContainer = useRef(null);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const navigate = useNavigate();

  const [passwordError, setPasswordError] = useState<string>("");

  const animationRef = useRef<AnimationItem | null>(null);

  const handleDelete = async () => {
    const passwordValidationError = validateLoginPassword(password);
    setPasswordError(passwordValidationError);

    if (passwordValidationError) {
      return; // 비밀번호 오류가 있으면 여기서 함수를 종료
    }

    if (reason === "") {
      toast.error("탈퇴 사유를 입력해주세요!", {
        className: "toast-error toast-container",
      });
      return;
    }

    try {
      const response = await deleteUser(password);
      console.log("회원탈퇴 성공!", response);
      setShowAnimation(true); // 성공하면 애니메이션 표시
      setTimeout(() => {
        navigate("/login"); // 3초 후에 로그인 페이지로 이동
      }, 3000);
    } catch (error) {
      console.log("회원탈퇴 실패! 왜인지 알아보자", error);
      setPasswordError("비밀번호를 다시 확인해주세요."); // 여기에서 에러 메시지 설정
    }
  };

  useEffect(() => {
    if (showAnimation && lottieContainer.current) {
      animationRef.current = lottie.loadAnimation({
        container: lottieContainer.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/animations/goodbye-animation.json",
      });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy(); // 컴포넌트 unmount 시 애니메이션 중지
      }
    };
  }, [showAnimation]);

  return (
    <St.DeleteUserContainer>
      <St.DeleteUserWrap>
        <p>비밀번호 재입력</p>
        <div className="input-wrap">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <St.ErrorMessage>{passwordError}</St.ErrorMessage>}
        </div>
      </St.DeleteUserWrap>
      <St.DeleteUserWrap>
        <div className="textarea-wrap">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="
  탈퇴하는 사유를 입력해주세요 🙂

  소중한 피드백은 더 좋은 서비스를 제공하기 위해
  적극적으로 반영하도록 하겠습니다!"
          />
        </div>
      </St.DeleteUserWrap>
      <Button onClick={handleDelete}>탈퇴하기</Button>
      <St.AnimationContainer ref={lottieContainer}></St.AnimationContainer>
    </St.DeleteUserContainer>
  );
};

export default DeleteUser;
