package com.example.DATN.repository.content;

import com.example.DATN.entity.Video;
import com.example.DATN.entity.YouTubeChannel;
import com.example.DATN.repository.projections.*;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface VideoRepository extends JpaRepository<Video, Long> {
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM videos WHERE id = :id", nativeQuery = true)
    void hardDelete(Long id);

    @Modifying
    @Transactional
    @Query(value = "UPDATE videos SET deleted_at = NULL, status = 'Nháp' WHERE id = :id", nativeQuery = true)
    void restore(Long id);

    long countByStatus(String status);

    boolean existsByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);

    // Query cho admin - lấy thông tin video chi tiết
    @Query("""
            select v.id as id,
            	   v.title as title,
            	   v.url as url,
            	   v.difficulty as difficulty,
            	   v.duration as duration,
            	   v.wordsHighlighted as wordsHighlighted,
            	   v.status as status,
            	   v.thumbnail as thumbnail,
            	   v.filePath as filePath,
            	   v.subtitleStatus as subtitleStatus,
            	   v.createdAt as createdAt,
            	   v.updatedAt as updatedAt,
            	   v.deletedAt as deletedAt,
            	   v.views as views,
            	   c.id as channelId,
            	   c.name as channelName
            from Video v
            left join v.channel c
            order by v.id desc
            """)
    List<VideoManagementProjection> findVideoManagementRows();

    @Query(value = """
            select v.id as id,
                   v.title as title,
                   v.url as url,
                   v.difficulty as difficulty,
                   v.duration as duration,
                   v.words_highlighted as wordsHighlighted,
                   v.status as status,
                   v.thumbnail as thumbnail,
                   v.file_path as filePath,
                   v.subtitle_status as subtitleStatus,
                   v.created_at as createdAt,
                   v.updated_at as updatedAt,
                   v.deleted_at as deletedAt,
                   v.views as views,
                   c.id as channelId,
                   c.name as channelName
            from videos v
            left join youtube_channels c on c.id = v.channel_id
            where v.deleted_at is not null
            order by v.deleted_at desc
            """, nativeQuery = true)
    List<VideoManagementProjection> findDeletedRows();

    // Phương thức cho user - tìm video theo kênh
    List<Video> findByChannel(YouTubeChannel channel);
}
