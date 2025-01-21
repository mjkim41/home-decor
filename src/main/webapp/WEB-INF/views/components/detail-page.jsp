<%-- src/main/webapp/WEB-INF/views/components/detail-page.jsp --%>

<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<%-- TODO : 공통 헤더영역 분리--%>

<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>00님의 게시물</title>

  <!-- Font Awesome 아이콘 라이브러리 -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

  <!-- External CSS 파일 링크 -->
  <link rel="stylesheet" href="/css/detailPage.css">

  <!-- Detail-page JS -->
  <script src="/js/components/detail-page.js" defer></script>
  <script type="module" src="/js/components/login-redirect.js" defer></script>
  <script type="module" src="/js/components/check-login-or-not.js" defer></script>
</head>
<body>
<!-- Header -->
<header class="header">
  <div class="logo">
    <!-- 로고 이미지 -->
    <img src="/images/logo.png" alt="오늘의집 로고">
  </div>
  <nav class="nav">
    <a href="/login" class="login">로그인</a>
    <a href="#">홈</a>
    <a href="#">커뮤니티</a>
    <a href="#">집들이</a>
    <a href="#" id="write-button">글쓰기</a>
  </nav>
</header>

<!-- Filter Container -->
<div class="filter-container">
  <div class="title-container">
    <span>집사진</span>
    <span>추천</span>
    <span>#채널</span>
    <span>3D인테리어</span>
    <span>반려동물</span>
    <span>육아</span>
    <span>홈스토랑</span>
    <span>플랜테니어</span>
    <span>콜렉터블</span>
    <span>캠핑</span>
    <span>이벤트</span>
  </div>
</div>

<!-- Post detail -->
<div class="post-container" id="post-container">
  <div class="post-item">
    <!-- 게시물 이미지 및 내용 -->
    <img src="/images/roominside.jpg" alt="집 내부 이미지">
    <div class="post-contents">내 방이야</div>
    <!-- 날짜, 좋아요, 조회수 -->
    <div class="post-info">
      <span class="post-date">${postDetail.createdAt}</span>
      <span class="like-count">좋아요 1</span>
      <span class="view-count">조회 13</span>
    </div>
    <!-- 프로필 영역 -->
    <div class="post-profile">
      <img src="https://image.ohou.se/i/bucketplace-v2-development/uploads/default_images/avatar.png?w=72&h=72&c=c"
           srcset="https://image.ohou.se/i/bucketplace-v2-development/uploads/default_images/avatar.png?w=72&h=72&c=c 1x,
          https://image.ohou.se/i/bucketplace-v2-development/uploads/default_images/avatar.png?w=144&h=144&c=c 2x,
          https://image.ohou.se/i/bucketplace-v2-development/uploads/default_images/avatar.png?w=216&h=216&c=c 3x" alt="프로필 이미지">
      <div class="profile-info">
        <div class="profile-name">테스터</div>
      </div>
    </div>

    <!-- 댓글 입력 영역 -->
    <div class="comment-section">
      <!-- 댓글 수 -->
      <div class="comment-counter">
        댓글
        <span class="comment-count">1</span>
      </div>

      <!-- 프로필 이미지 -->
      <div class="comment-box">
        <div class="comment-profile">
          <img src="https://image.ohou.se/i/bucketplace-v2-development/uploads/default_images/avatar.png?w=40&h=40&c=c"
               alt="프로필 이미지">
        </div>
        <!-- 댓글 입력창 -->
        <div class="comment-input-container">
          <input type="text" class="comment-input" placeholder="댓글을 입력하세요">
          <button class="comment-submit-button">입력</button>
        </div>
      </div>
    </div>
  </div>



  <%--  고정바 (좋아요 클릭, 댓글 바로가기)--%>
  <div class="sticky-section">
    <button class="action-button like-button">
      <i class="fa-regular fa-heart like-icon"></i>
      <span class="like-count">26</span>
    </button>
    <button class="action-button comment-button">
      <i class="fa-regular fa-comment"></i>
      <span class="comment-count">2</span>
    </button>
  </div>

</div>

