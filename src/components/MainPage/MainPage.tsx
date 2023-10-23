import React, { useState, useEffect } from "react";
import * as St from "./STMainPage";
import Banner from "../common/Banner/Banner";
import Search from "../common/Search/Search";
import Selector from "../common/Selector/Selector";
import Card from "../common/Card/Card";
import FixedButton from "../common/FixedButton/FixedButton";
import { useQuery } from "react-query";
import axios, { AxiosInstance } from "axios";
import { Spinner } from "../common/Spinner";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useLanguage } from "../../util/Locales/useLanguage";
import { useRecoilState } from "recoil";
import { locationState, sidoOptionsState, gugunOptionsState, categoryOptionsState } from "../../recoil/atoms/SelectState";

const MainPage: React.FC = () => {
  const { t } = useLanguage();
  const accessToken = localStorage.getItem("accessToken");

  // 각 샐랙터에 대한 Recoil 전역 상태 관리
  const [ , setLocationOptions] = useRecoilState(locationState);
  const [ , setSidoOptions] = useRecoilState(sidoOptionsState);
  const [ , setGugunOptions] = useRecoilState(gugunOptionsState);
  const [ , setCategoryOptions] = useRecoilState(categoryOptionsState);

  // 선택된 옵션에 대한 상태 관리
  const [selectedVerify, setSelectedVerify] = useState<string>(""); // 위치 인증 여부
  const [selectedSido, setSelectedSido] = useState<string>("서울특별시"); // 시도
  const [selectedGugun, setSelectedGugun] = useState<string>(""); // 구군
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // 카테고리
  // 사용하지 않는 변수임을 명시적으로 알리기
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const unusedVariables = { selectedVerify, selectedGugun, selectedCategory };

  // AxiosInstance & API 설정
  const customAxios: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_URL,
    headers: {
      Authorization: `${accessToken}`,
    },
  });
  const mainAPI = {
    locationApi: () => customAxios.get("data/toss"), // 위치 인증 여부
    sidoApi: () => customAxios.get("data/city"), // 시도
    gugunApi: (sido: string) =>
      customAxios.get("data/gu_name", {
        // 구군
        params: { doName: sido },
      }),
    categoryApi: () => customAxios.get("data/toss"), // 카테고리
    cardListApi: () => customAxios.get("events"), // 게시글 전체 조회
  };

  // 위치 인증 여부 interface (console.log 기준)
  interface CategoryOptionsProps {
    data: {
      category: string[];
      verify: string[];
    };
  }

  // 위치 인증 여부 - DB 연동
  const { data: locationOptionsData } = useQuery<CategoryOptionsProps[], Error>(
    "locationOptions",
    async () => {
      const response = await mainAPI
        .locationApi()
        .then((response) => {
          const verifyOptions = response.data.verify;
          setLocationOptions(verifyOptions);
          return verifyOptions;
        })
        .catch((error) => {
          console.log("위치 인증 여부 불러오기 실패", error);
          throw error;
        });
      return response;
    }
  );

  // 시/도 옵션 interface (console.log 기준)
  interface SidoOptionsProps {
    doName: string[];
  }

  // 시/도 옵션 - DB 연동
  const { data: sidoOptionsData } = useQuery<SidoOptionsProps[]>(
    "sidoOptions",
    async () => {
      const response = await mainAPI
        .sidoApi()
        .then((response) => {
          const sidoOptions = response.data;
          setSidoOptions(sidoOptions);
          return sidoOptions;
        })
        .catch((error) => {
          console.log("시/도 불러오기 실패", error);
          throw error;
        });
      return response;
    }
  );

  // 구/군 옵션 interface (console.log 기준)
  interface GugunOptionsProps {
    guName: string[];
  }

  // 구/군 옵션 - DB 연동
  const { data: gugunOptionsData, refetch: refetchGugunOptions } = useQuery<
    GugunOptionsProps[]
  >(
    // queryKey를 배열로 감싸서 설정
    ["gugunOptions", selectedSido],
    async () => {
      const response = await mainAPI
        .gugunApi(selectedSido)
        .then((response) => {
          const gugunOptions = response.data;
          setGugunOptions(gugunOptions);
          return gugunOptions;
        })
        .catch((error) => {
          console.log("구/군 불러오기 실패", error);
          throw error;
        });
      return response;
    },
    {
      enabled: !!selectedSido, // 선택된 시/도가 있을 때만 요청을 보내도록 설정
    }
  );

  // refetch를 통해 시/도 옵션이 바뀌면 구/군 옵션이 바로 바뀌도록 설정
  useEffect(() => {
    refetchGugunOptions();
  }, [selectedSido]);

  // 카테고리 옵션 - DB 연동
  const { data: categoryOptionsData } = useQuery<CategoryOptionsProps[]>(
    "categoryOptions",
    async () => {
      const response = await mainAPI
        .categoryApi()
        .then((response) => {
          const categoryOptions = response.data.category;
          setCategoryOptions(categoryOptions);
          return response.data.category;
        })
        .catch((error) => {
          console.log("카테고리 옵션 카테고리 불러오기 실패", error);
          throw error;
        });
      return response;
    }
  );

  // 게시글 전체 조회 interface (console.log 기준)
  interface CardProps {
    event: {
      category: string;
      content: string;
      createdAt: string;
      eventDate: string;
      eventId: number;
      eventLocation: string;
      eventName: string;
      isDeleted: boolean;
      isVerified: string;
      maxSize: number;
      signupEndDate: string;
      signupStartDate: string;
      updatedAt: string;
    };
    guestList: number[];
    hostUser: [
      {
        userDetailId: number;
        UserId: number;
        nickname: string;
        intro: string;
        profileImg: string;
        updatedAt: string;
      }
    ];
  }

  // 게시글 전체 조회 - DB 연동
  const { isLoading: postsLoading, data: postData } = useQuery<CardProps[]>(
    "get",
    async () => {
      const response = await mainAPI
        .cardListApi()
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.log("게시글 전체조회 에러!", error);
          throw error;
        });
      return response;
    }
  );

  // 로딩 중인 경우
  if (postsLoading) return <Spinner />;

  // 데이터가 없는 경우
  if (!postData || postData.length === 0) {
    return (
      <>
        <Banner></Banner>
        <Search></Search>
        <div>앗! 게시글이 없어요 😓</div>
        <FixedButton></FixedButton>
      </>
    );
  }

  // Link 컴포넌트에 스타일을 적용하기 위해 styled-components를 사용
  const CustomLink = styled(Link)`
    text-decoration: none;
    color: inherit;
  `;

  return (
    <>
      <Banner></Banner>
      <Search></Search>
      <St.SelectorWrap>
        {/* 위치 인증 여부 : 아무나 환영 | 우리 동네만 */}
        <Selector
          options={locationOptionsData?.map((item) => ({
            value: t(item),
            label: t(item),
          }))}
          onChange={(selectedOption: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedVerify(selectedOption.target.value);
          }}
        ></Selector>
        {/* 시/도 */}
        <Selector
          options={sidoOptionsData?.map((item) => ({
            value: t(item.doName),
            label: t(item.doName),
          }))}
          onChange={(selectedOption: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedSido(selectedOption.target.value);
          }}
        ></Selector>
        {/* 구/군 */}
        <Selector
          options={gugunOptionsData?.map((item) => ({
            value: t(item.guName),
            label: t(item.guName),
          }))}
          onChange={(selectedOption: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedGugun(selectedOption.target.value);
          }}
        ></Selector>
        {/* 카테고리 : 맛집/커피, 운동/건강, 애완동물, 공부/교육 */}
        <Selector
          options={categoryOptionsData?.map((item) => ({
            value: t(item),
            label: t(item),
          }))}
          onChange={(selectedOption: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedCategory(selectedOption.target.value);
          }}
        ></Selector>
      </St.SelectorWrap>
      {/* 카드 */}
      {postData.map((postDataItem, index) => (
        <CustomLink to={`/postview/${postDataItem.event.eventId}`}>
          <Card key={index} {...postDataItem}></Card>
        </CustomLink>
      ))}
      <FixedButton></FixedButton>
    </>
  );
};

export default MainPage;
