package com.decormasters.homedecor.service;

import com.decormasters.homedecor.Util.FileUploadUtil;
import com.decormasters.homedecor.domain.member.dto.request.SignUpRequest;
import com.decormasters.homedecor.domain.member.entitiy.Member;
import com.decormasters.homedecor.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final FileUploadUtil fileUploadUtil;

    // 회원 정보 생성
    public void saveUser(SignUpRequest signUpRequest) {

        // 프로필 이미지 URL 초기화(image 없을 떄도 sql 명령어 만들어야 하므로)
         String uploadedImageUrl = null;

        // entity로 변환
        Member newUser = signUpRequest.toEntity();

        // 이미지 관련 : 이미지 저장 + db에 저장할 경로 가져오기
        //  - 이미지 프로필 하나만 쓸꺼지만, 차후를 대비하여 List로 받아옴
        if (signUpRequest.getProfileImage() != null) {
            List<String> uploadedImageUrlList = processProfileImage(signUpRequest.getProfileImage());
            uploadedImageUrl = uploadedImageUrlList.get(0);
        }

        // 아이디 생성 : 실패하면 0, 성공하면 1
        int result = memberRepository.insertUser(newUser, uploadedImageUrl);
        if (result > 0) {
            log.info("Inserted user into database successfully {}", signUpRequest.getEmail());
        } else {
            log.error("Failed to insert user into database {}", signUpRequest.getEmail());
        }
    }

    private List<String> processProfileImage(List<MultipartFile> profileImage) {

        List<String> uploadedUrlList = new ArrayList<>();

        profileImage.forEach(imageFile -> {
            // 파일 저장
            String uploadedUrl = fileUploadUtil.saveFile(imageFile);

            //  이미지 저장 성공적 완료 알림
            log.info("success to save file at: {}", uploadedUrl);

            uploadedUrlList.add(uploadedUrl);
        });

        return uploadedUrlList;


    }


}







