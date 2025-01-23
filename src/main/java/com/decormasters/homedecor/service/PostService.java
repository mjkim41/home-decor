package com.decormasters.homedecor.service;


import com.decormasters.homedecor.domain.like.dto.LikeStatusResponse;
import com.decormasters.homedecor.domain.member.entity.Member;
import com.decormasters.homedecor.domain.post.dto.request.PostCreate;
import com.decormasters.homedecor.domain.post.dto.response.PostDetailResponse;
import com.decormasters.homedecor.domain.post.dto.response.PostResponse;
import com.decormasters.homedecor.domain.post.entity.Post;
import com.decormasters.homedecor.domain.post.entity.PostImage;
import com.decormasters.homedecor.exception.ErrorCode;
import com.decormasters.homedecor.exception.PostException;
import com.decormasters.homedecor.repository.MemberRepository;
import com.decormasters.homedecor.repository.PostLikeRepository;
import com.decormasters.homedecor.repository.PostRepository;
import com.decormasters.homedecor.utils.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@Slf4j
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository; // db에 피드내용 저장, 이미지저장
    private final MemberService memberService; // 사용자 정보 가져오기
    private final PostLikeService postLikeService; // 좋아요 정보 가져오기

    private final FileUploadUtil fileUploadUtil; // 로컬서버에 이미지 저장

    // 전체 유저의 게시물 조회
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts(String email) {
        Optional<Member> foundMemberOptional = memberService.getMemberByEmail(email);

        if (foundMemberOptional.isPresent()) {
            Member foundMember = foundMemberOptional.get();

            return postRepository.findAllPosts()
                    .stream()
                    .map(post -> {
                        // PostLikeService로 좋아요 상태를 계산
                        LikeStatusResponse likeStatus = postLikeService.getLikeStatus(post.getPostId(), foundMember.getId());
                        return PostResponse.of(post, likeStatus);
                    })
                    .collect(Collectors.toList());
        } else {
            return postRepository.findAllPosts()
                    .stream()
                    .map(post -> PostResponse.of(post, null))
                    .collect(Collectors.toList());
        }
    }

    // 피드 생성 DB에 가기 전 후 중간처리
    @Transactional
    // 피드 생성 DB에 가기 전 후 중간처리
    public Long createFeed(PostCreate postCreate) {

        // entity 변환
        Post post = postCreate.toEntity();

        // 피드 게시물을 post 테이블에 insert
        postRepository.saveFeed(post);

        // 이미지 관련 처리를 모두 수행


        Long postId = post.getPostId();
        processImages(postCreate.getImages(), postId);

        // 컨트롤러에게 결과 반환
        return postId;

    }

    private void processImages(List<MultipartFile> images, Long postId) {

        // 이미지들을 서버(/upload 폴더)에 저장
        if (images != null && !images.isEmpty()) {
            log.debug("saveprocess Image");

            int order = 1;
            for (MultipartFile image : images) {
                // 파일 서버에 저장
                String uploadedUrl = fileUploadUtil.saveFile(image);

                log.debug("success to save file at: {}", uploadedUrl);
                // 이미지들을 데이터베이스 post_images 테이블에 insert
                PostImage postImage = PostImage.builder()
                        .postId(postId)
                        .imageUrl(uploadedUrl)
                        .imageOrder(order++)

                        .build();

                postRepository.saveFeedImage(postImage);

            }
        }
    }

    // 게시물 단일 조회 처리
    @Transactional(readOnly = true)
    public PostDetailResponse getPostDetails(Long postId, String email) {

        Post post = postRepository.findPostDetailById(postId)
                .orElseThrow(
                        () -> new PostException(ErrorCode.POST_NOT_FOUND)
                );

        // 로그인한 사용자 확인
        Optional<Member> foundMemberOptional = memberService.getMemberByEmail(email);

        // 로그인한 사용자일 경우
        if (foundMemberOptional.isPresent()) {
            Member loggedInMember = foundMemberOptional.get(); // 로그인한 사용자

            log.info("logged in member: {}", loggedInMember.getId());
            log.info("logged in member: {}", loggedInMember.getNickname());
            log.info("logged in member: {}", loggedInMember.getImgUrl());

            // PostLikeService를 통해 좋아요 상태 계산
            LikeStatusResponse likeStatus = postLikeService.getLikeStatus(postId, loggedInMember.getId());

            return PostDetailResponse.of(post, loggedInMember, likeStatus);
        } else {
            // 비회원일 경우 likeStatus를 null로 설정
            return PostDetailResponse.of(post, null, null);
        }
    }
}
