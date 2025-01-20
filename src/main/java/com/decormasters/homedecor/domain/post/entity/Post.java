package com.decormasters.homedecor.domain.post.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    private Long id;
    private String content;
    private Long userId;  // 이 피드를 쓴 사용자의 ID
    private int viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}