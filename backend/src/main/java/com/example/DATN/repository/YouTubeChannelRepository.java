package com.example.DATN.repository;

import com.example.DATN.entity.YouTubeChannel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface YouTubeChannelRepository extends JpaRepository<YouTubeChannel, Long> {
    @Query("""
            select c.id as id,
                   c.name as name,
             c.url as url,
                   count(v.id) as videoCount
            from YouTubeChannel c
            left join Video v on v.channel.id = c.id
         group by c.id, c.name, c.url
            order by c.id desc
            """)
    List<YouTubeChannelManagementProjection> findChannelManagementRows();
}
