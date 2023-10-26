import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as St from "./STMakeList";
import { getEvents, deleteEvent } from "../../../api/api";
import { useLanguage } from "../../../util/Locales/useLanguage";
import { useRecoilValue } from "recoil";
import { userState } from "../../../recoil/atoms/UserState";
import toast from "react-hot-toast";

interface Event {
  eventId: number;
  eventName: string;
  eventDate: string;
  eventImg: string;
  eventLocation: string;
  content: string;
  category: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const MakeList: React.FC = () => {
  const user = useRecoilValue(userState); // Recoil에서 user 정보 가져오기
  const userId = user.userId;
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const fetchEvents = useCallback(async () => {
    try {
      if (!userId) throw new Error("User not logged in");
      const data = await getEvents(Number(userId));
      console.log(data);
      const userEvents = data.HostEvents.map(
        (item: { Event: Event }) => item.Event
      );

      const sortedEvents = userEvents.sort((a: Event, b: Event) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      setEvents(sortedEvents);
    } catch (error) {
      console.error("글목록 불러오기 실패:", error);
    }
  }, [userId]);

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await deleteEvent(eventId);
      fetchEvents();
      toast.success(t("삭제가 완료되었습니다."), {
        className: "toast-success toast-container",
      });
    } catch (error) {
      console.error("글 삭제 실패:", error);
    }
  };

  const handlePostClick = (eventId: number) => {
    navigate(`/postview/${eventId}`);
  };

  const handleUpdateClick = (eventId: number) => {
    navigate(`/post/update/${eventId}`);
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <>
      {events.length > 0 ? (
        <St.MyPageContainer>
          <St.MyPageWrap>
            <div>
              {events.map((event) => (
                <St.UserPostForm key={event.eventId}>
                  <h2 onClick={() => handlePostClick(event.eventId)}>
                    {event.eventName}
                  </h2>
                  <St.UserPostButtonWrap>
                    <button onClick={() => handleUpdateClick(event.eventId)}>
                      {t("수정")}
                    </button>
                    <button onClick={() => handleDeleteEvent(event.eventId)}>
                      {t("삭제")}
                    </button>
                  </St.UserPostButtonWrap>
                </St.UserPostForm>
              ))}
            </div>
          </St.MyPageWrap>
        </St.MyPageContainer>
      ) : (
        <St.MyPageContainer>
          <St.MyPageWrap>
            <St.NoEventMessage>
              {t("생성하신 이벤트가 없습니다.")}
            </St.NoEventMessage>
          </St.MyPageWrap>
        </St.MyPageContainer>
      )}
    </>
  );
};

export default MakeList;
