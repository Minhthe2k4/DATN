package com.example.DATN.repository.content;

import com.example.DATN.entity.YouTubeChannel;
import com.example.DATN.repository.projections.*;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface YouTubeChannelRepository extends JpaRepository<YouTubeChannel, Long> {
        @Modifying
        @Transactional
        @Query(value = "DELETE FROM youtube_channels WHERE id = :id", nativeQuery = true)
        void hardDelete(Long id);

        @Modifying
        @Transactional
        @Query(value = "UPDATE youtube_channels SET deleted_at = NULL, status = 'Hoạt động' WHERE id = :id", nativeQuery = true)
        void restore(Long id);

        @Query("""
                        select c.id as id,
                               c.name as name,
                               c.url as url,
                               c.description as description,
                               c.status as status,
                               c.avatar as avatar,
                               c.handle as handle,
                               c.subscriberCount as subscriberCount,
                               c.createdAt as createdAt,
                               c.updatedAt as updatedAt,
                               c.deletedAt as deletedAt,
                               (select count(v.id) from Video v where v.channel.id = c.id) as videoCount
                        from YouTubeChannel c
                        order by c.id desc
                        """)
        List<YouTubeChannelManagementProjection> findChannelManagementRows();

        @Query(value = """
                        select c.id as id,
                               c.name as name,
                               c.url as url,
                               c.description as description,
                               c.status as status,
                               c.avatar as avatar,
                               c.handle as handle,
                               c.subscriber_count as subscriberCount,
                               c.created_at as createdAt,
                               c.updated_at as updatedAt,
                               c.deleted_at as deletedAt,
                               (select count(v.id) from videos v where v.channel_id = c.id) as videoCount
                        from youtube_channels c
                        where c.deleted_at is not null
                        order by c.deleted_at desc
                        """, nativeQuery = true)
        List<YouTubeChannelManagementProjection> findDeletedRows();

        boolean existsByNameIgnoreCase(String name);

        boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
