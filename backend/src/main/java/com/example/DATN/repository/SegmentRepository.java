package com.example.DATN.repository;

import com.example.DATN.entity.Segment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SegmentRepository extends JpaRepository<Segment, Long> {

    // Lấy segment theo video ID (sẵn có)
    List<Segment> findByVideoId(Long videoId);

    // Lấy tất cả segment sắp xếp theo thứ tự (dùng khi trả về frontend)
    List<Segment> findByVideoIdOrderBySegmentOrderAsc(Long videoId);

    // Xóa toàn bộ segment của một video (dùng khi tạo lại phụ đề)
    @Modifying
    @Transactional
    @Query("delete from Segment s where s.video.id = :videoId")
    void deleteByVideoId(@Param("videoId") Long videoId);
}
