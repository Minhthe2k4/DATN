package com.example.DATN.repository;

import com.example.DATN.entity.Video;
import com.example.DATN.entity.YouTubeChannel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VideoRepository extends JpaRepository<Video, Long> {
	// Query cho admin - lấy thông tin video chi tiết
	@Query("""
			select v.id as id,
				   v.title as title,
				   v.url as url,
				   c.id as channelId,
				   c.name as channelName
			from Video v
			left join v.channel c
			order by v.id desc
			""")
	List<VideoManagementProjection> findVideoManagementRows();

	// Phương thức cho user - tìm video theo kênh
	List<Video> findByChannel(YouTubeChannel channel);
}
