CREATE DATABASE  IF NOT EXISTS `vocab_learning` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `vocab_learning`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: vocab_learning
-- ------------------------------------------------------
-- Server version	5.7.44-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `article_topics`
--

DROP TABLE IF EXISTS `article_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_topics` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID chủ đề bài báo',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả',
  `level` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `article_topic_image` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_topics`
--

LOCK TABLES `article_topics` WRITE;
/*!40000 ALTER TABLE `article_topics` DISABLE KEYS */;
INSERT INTO `article_topics` VALUES (1,'Daily News','Hay','Trung bình',1,''),(2,'Good news','Good','Cơ bản',1,'');
/*!40000 ALTER TABLE `article_topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tiêu đề',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung',
  `source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nguồn bài viết',
  `topic_id` int(11) DEFAULT NULL COMMENT 'Chủ đề bài viết',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  `difficulty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `words_highlighted` int(11) NOT NULL DEFAULT '0',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `article_image` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `topic_id` (`topic_id`),
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `article_topics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (2,'Live updates: US gas hits $4 as Trump tells other nations to ‘go get your own oil’ | CNN','• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\n\n• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.\n\n• US tech companies threatened: Apple, Microsoft, Google, Meta, IBM, HP, Intel and Tesla are among the 17 American companies Tehran has threatened to attack if more Iranian leaders are killed, according to the semi-official outlet Fars.','https://edition.cnn.com/2026/03/31/world/live-news/iran-war-us-trump-oil',2,'2026-03-31 18:57:00','Trung bình',5,'Đã xuất bản','https://media.cnn.com/api/v1/images/stellar/prod/03-2026-03-04t182121z-2122628346-rc24vjaejhvb-rtrmadp-3-iran-crisis-1.jpg?c=16x9&q=w_800,c_fill'),(3,'Latin America’s generational shift: What’s causing record-low birth rates across the region? | CNN','<figure class=\"article-inline-image\"><img src=\"https://media.cnn.com/api/v1/images/stellar/prod/c-gettyimages-1860795492.jpg?c=original&amp;q=w_1041\" alt=\"People walk along Alameda Avenue at sunset in Santiago on December 19, 2023.\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><figcaption class=\"article-inline-caption\">Lee este artículo en español</figcaption><p>Along Vespucio Sur Avenue, one of the main strips of Santiago, Chile, a massive real estate billboard advertises a new housing complex: “Green areas, barbecue space, pet-friendly sector.” The growing focus on spaces for pets as a major real estate selling point for couples has spread across the region, and the same sign could be seen in Bogotá, Rio de Janeiro, or any other major Latin American city.</p><p>In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same is true in Quito, Ecuador.</p><p>The growing humanization of pets in households across Latin America and the Caribbean is perhaps the most tangible symptom of a new generational change. Motherhood is no longer a presumed role, and birth rates are falling at an unprecedented pace.</p><p>The data comes from the latest Demographic Observatory by ECLAC (the UN Economic Commission for Latin America and the Caribbean), focused on declining fertility. Latin America now averages 1.8 children per woman, below the replacement level of 2.1 needed to sustain a stable population. Compare that to the 1950s, when Latin American women had an average of 5.8 children.</p><p>Simone Cecchini, director of the Latin American and Caribbean Demographic Center at ECLAC, told CNN the change has been much faster than in Europe. “It even exceeded what the United Nations projected two decades ago.”</p><p>“According to our estimates, the total population of Latin America and the Caribbean will grow until 2053 and, from then on, will begin to decline on average,” Cecchini says. Some countries and territories are already experiencing this – Cuba and Uruguay have declining populations, as do several Caribbean islands.</p><h2>Teen pregnancies</h2><p>Every morning, on her way to the Pontifical Catholic University of Chile, sociologist Martina Yopo Díaz looks at the Vespucio Sur housing billboard as symptomatic of how “children, and reproduction in a broader sense, are occupying an increasingly marginal place in the life projects of younger generations.”</p><p>In demography, a fertility rate below 1.3 children per woman is considered ultra-low. Chile’s rate has fallen to 1.1 children per woman, the lowest in Latin America and among the lowest in the world, according to ECLAC data. Costa Rica (1.32), Uruguay (1.39) and Argentina (1.5) are not far behind, while several Caribbean countries are also at ultra-low levels.</p><p>While Yopo Díaz describes it as a “multi-causal phenomenon,” a key change has been a decline in teenage pregnancies.</p><p>“In Chile, teenage pregnancy rates have dropped by nearly 80% over the past decade, a public health achievement linked to policies promoting reproductive autonomy and greater access to contraception,” she explains.</p><p>Similar trends have occurred across Latin America. According to ECLAC, there were 70 live births per 1,000 women aged 15 to 19 in 2014. That figure dropped to around 50 in 2024.</p><p>Even so, teen pregnancy rates in Latin America and the Caribbean remain higher than in any other region of the world except Africa.</p><h2>Link to inequality</h2><p>In a region marked by inequality, the decline in birth rates does not affect all groups equally. According to Cecchini, studies show that lower-income women tend to have more children than they would like, while higher-income women tend to have fewer than they want.</p><p>Motherhood can also widen the gap between the two groups because it is more likely to be a barrier to employment for women from lower-income families, who are less likely to be able to afford childcare.</p><p>Education also plays a role, with more educated women tending to have fewer children. According to Our World in Data, Mexican women had an average of 3.4 children and 6.4 years of schooling in 1990; by 2020, they had 1.9 children and more than 10 years of schooling. Similar trends can be seen in Colombia, Brazil, and elsewhere.</p><p>As Cecchini puts it, “Women’s participation in the work force, gender inequality, and fertility form a very complex knot.”</p><h2>Can the trend be reversed?</h2><p>Experts tend to be cautious. Globally, countries that have implemented pro-natalist policies – bonuses, generous parental leave – have achieved, at best, modest or temporary increases.</p><p>“In Europe, what we’ve seen is that these policies often bring forward the age at which women have children,” says Cecchini.</p><p>This is not insignificant, as delaying parenthood tends to affect the number of children a mother has. However, as Yopo Díaz points out, “there are people who will not want to have children, regardless of policies.”</p><figure class=\"article-inline-image\"><img src=\"https://media.cnn.com/api/v1/images/stellar/prod/c-gettyimages-2258175014.jpg?c=original&amp;q=w_860\" alt=\"A man and a child ride bicycles in the Bicentenario Park in Santiago on January 28, 2026.\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><p>What policymakers can do, she argues, is make things easier for those people who do want to be parents but feel they lack the money, time, or stability.</p><p>Rather than fixate on the question of how many children are being born, she suggests focusing on building a society in which “the decision to have children is not a burden for one particular group, especially for women.”</p><h2>Aging populations</h2><p>Falling birth rates coupled with rising life expectancies result in aging populations, which in turn strain economic growth, healthcare and benefit systems as a smaller pool of working age people are required to support, through taxes, a growing pool of retirees.</p><p>It’s a shift that is visible in everyday life.</p><p>In Chile, Yopo Díaz says, there is increasing discussion about the closure of maternity wards due to lower demand. In Argentina, headlines report school closures due to declining enrollment.</p><p>A report by Argentinos por la Educación estimates that by 2030, school enrollment could drop by 27% nationwide; in Uruguay, official figures show 15% fewer students aged 3 to 17 compared to three decades ago with projections heading downward. At the regional level, data from UNESCO and the International Institute for Educational Planning indicate that between 2015 and 2023 there were 1.2 million fewer births, and that by 2030 there will be 11.5 million fewer school-age children and teenagers than in 2020.</p><p>Where some see a problem, others see an opportunity. While some experts fear aging societies are storing up economic problems, others say there could be unexpected boons. For instance, they say, if there are fewer children, governments and families could invest more per student.</p><p>Still, most experts agree that if societies are to design effective policies then the complexity of the situation must be acknowledged.</p><p>There is no single reason for declining fertility, they say, but a mesh of overlapping layers – health and education policies, economic disparities, new gender expectations, and a cultural climate in which “having children” is no longer a mandatory box to check.</p>','https://edition.cnn.com/2026/03/31/americas/latin-america-birth-rates-fall-latam-intl',1,'2026-03-31 19:12:00','Trung bình',14,'Đã xuất bản','https://media.cnn.com/api/v1/images/stellar/prod/c-gettyimages-1860795492.jpg?c=16x9&q=w_800');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaderboard`
--

DROP TABLE IF EXISTS `leaderboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboard` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người dùng',
  `score` int(11) DEFAULT NULL COMMENT 'Điểm',
  `rank` int(11) DEFAULT NULL COMMENT 'Xếp hạng',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `leaderboard_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboard`
--

LOCK TABLES `leaderboard` WRITE;
/*!40000 ALTER TABLE `leaderboard` DISABLE KEYS */;
/*!40000 ALTER TABLE `leaderboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_vocabulary`
--

DROP TABLE IF EXISTS `lesson_vocabulary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_vocabulary` (
  `lesson_id` int(11) NOT NULL COMMENT 'ID bài học',
  `vocab_id` int(11) NOT NULL COMMENT 'ID từ vựng',
  PRIMARY KEY (`lesson_id`,`vocab_id`),
  KEY `vocab_id` (`vocab_id`),
  CONSTRAINT `lesson_vocabulary_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lesson_vocabulary_ibfk_2` FOREIGN KEY (`vocab_id`) REFERENCES `vocabulary` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_vocabulary`
--

LOCK TABLES `lesson_vocabulary` WRITE;
/*!40000 ALTER TABLE `lesson_vocabulary` DISABLE KEYS */;
INSERT INTO `lesson_vocabulary` VALUES (1,1),(1,2);
/*!40000 ALTER TABLE `lesson_vocabulary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID bài học',
  `topic_id` int(11) DEFAULT NULL COMMENT 'Thuộc chủ đề',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả',
  `status` bit(1) DEFAULT NULL,
  `lesson_image` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `topic_id` (`topic_id`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,3,'Bài 1','Học',NULL,NULL);
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lookup_history`
--

DROP TABLE IF EXISTS `lookup_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lookup_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `word` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `article_id` bigint(20) DEFAULT NULL,
  `sentence` text COLLATE utf8mb4_unicode_ci,
  `definitions_json` json DEFAULT NULL,
  `selected_index` int(11) DEFAULT NULL,
  `meaning_vi` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lookup_user` (`user_id`),
  KEY `idx_lookup_word` (`word`),
  KEY `fk_lookup_article` (`article_id`),
  CONSTRAINT `fk_lookup_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lookup_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lookup_history`
--

LOCK TABLES `lookup_history` WRITE;
/*!40000 ALTER TABLE `lookup_history` DISABLE KEYS */;
INSERT INTO `lookup_history` VALUES (1,1,'central',3,'In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i','[{\"index\": 0, \"example\": \"\", \"contextMatch\": true, \"definitionEn\": \"Being in the centre.\", \"definitionVi\": \"Tam dich: Being in the centre.\", \"partOfSpeech\": \"adjective\"}, {\"index\": 1, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Having or containing the centre of something.\", \"definitionVi\": \"Tam dich: Having or containing the centre of something.\", \"partOfSpeech\": \"adjective\"}, {\"index\": 2, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Being very important, or key to something.\", \"definitionVi\": \"Tam dich: Being very important, or key to something.\", \"partOfSpeech\": \"adjective\"}, {\"index\": 3, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Exerting its action towards the peripheral organs.\", \"definitionVi\": \"Tam dich: Exerting its action towards the peripheral organs.\", \"partOfSpeech\": \"adjective\"}]',0,'Tam dich: Being in the centre.','2026-04-01 02:27:47'),(2,1,'neighborhoods',3,'In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i','[{\"index\": 0, \"example\": \"Our neighborhood was our only reason to exchange hollow greetings.\", \"contextMatch\": false, \"definitionEn\": \"The quality of being a neighbor, of living nearby, next to each-other; proximity.\", \"definitionVi\": \"Tam dich: The quality of being a neighbor, of living nearby, next to each-other; proximity.\", \"partOfSpeech\": \"noun\"}, {\"index\": 1, \"example\": \"He lives in my neighborhood.\", \"contextMatch\": false, \"definitionEn\": \"Close proximity, nearby area; particularly, close proximity to one\'s home.\", \"definitionVi\": \"Tam dich: Close proximity, nearby area; particularly, close proximity to one\'s home.\", \"partOfSpeech\": \"noun\"}, {\"index\": 2, \"example\": \"The fire alarmed the neighborhood.\", \"contextMatch\": false, \"definitionEn\": \"The inhabitants of a residential area.\", \"definitionVi\": \"Tam dich: The inhabitants of a residential area.\", \"partOfSpeech\": \"noun\"}, {\"index\": 3, \"example\": \"We have just moved to a pleasant neighborhood.\", \"contextMatch\": true, \"definitionEn\": \"A formal or informal division of a municipality or region.\", \"definitionVi\": \"Tam dich: A formal or informal division of a municipality or region.\", \"partOfSpeech\": \"noun\"}, {\"index\": 4, \"example\": \"He must be making in the neighborhood of $200,000 per year.\", \"contextMatch\": false, \"definitionEn\": \"An approximate amount.\", \"definitionVi\": \"Tam dich: An approximate amount.\", \"partOfSpeech\": \"noun\"}, {\"index\": 5, \"example\": \"The slums and the palace were in awful neighborhood.\", \"contextMatch\": false, \"definitionEn\": \"The quality of physical proximity.\", \"definitionVi\": \"Tam dich: The quality of physical proximity.\", \"partOfSpeech\": \"noun\"}, {\"index\": 6, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The disposition becoming a neighbor; neighborly kindness or good will.\", \"definitionVi\": \"Tam dich: The disposition becoming a neighbor; neighborly kindness or good will.\", \"partOfSpeech\": \"noun\"}, {\"index\": 7, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Within a topological space:\", \"definitionVi\": \"Tam dich: Within a topological space:\", \"partOfSpeech\": \"noun\"}, {\"index\": 8, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Within a metric space:\", \"definitionVi\": \"Tam dich: Within a metric space:\", \"partOfSpeech\": \"noun\"}, {\"index\": 9, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The infinitesimal open set of all points that may be reached directly from a given point.\", \"definitionVi\": \"Tam dich: The infinitesimal open set of all points that may be reached directly from a given point.\", \"partOfSpeech\": \"noun\"}, {\"index\": 10, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The set of all the vertices adjacent to a given vertex.\", \"definitionVi\": \"Tam dich: The set of all the vertices adjacent to a given vertex.\", \"partOfSpeech\": \"noun\"}]',3,'Tam dich: A formal or informal division of a municipality or region.','2026-04-01 02:43:43'),(3,1,'nail',3,'In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i','[{\"index\": 0, \"example\": \"When I\'m nervous I bite my nails.\", \"contextMatch\": false, \"definitionEn\": \"The thin, horny plate at the ends of fingers and toes on humans and some other animals.\", \"definitionVi\": \"Tam dich: The thin, horny plate at the ends of fingers and toes on humans and some other animals.\", \"partOfSpeech\": \"noun\"}, {\"index\": 1, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The basal thickened portion of the anterior wings of certain hemiptera.\", \"definitionVi\": \"Tam dich: The basal thickened portion of the anterior wings of certain hemiptera.\", \"partOfSpeech\": \"noun\"}, {\"index\": 2, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The terminal horny plate on the beak of ducks, and other allied birds.\", \"definitionVi\": \"Tam dich: The terminal horny plate on the beak of ducks, and other allied birds.\", \"partOfSpeech\": \"noun\"}, {\"index\": 3, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The claw of a bird or other animal.\", \"definitionVi\": \"Tam dich: The claw of a bird or other animal.\", \"partOfSpeech\": \"noun\"}, {\"index\": 4, \"example\": \"\", \"contextMatch\": true, \"definitionEn\": \"A spike-shaped metal fastener used for joining wood or similar materials. The nail is generally driven through two or more layers of material by means of impacts from a hammer or other device. It is then held in place by friction.\", \"definitionVi\": \"Tam dich: A spike-shaped metal fastener used for joining wood or similar materials. The nail is gene...\", \"partOfSpeech\": \"noun\"}, {\"index\": 5, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"A round pedestal on which merchants once carried out their business, such as the four nails outside The Exchange, Bristol.\", \"definitionVi\": \"Tam dich: A round pedestal on which merchants once carried out their business, such as the four nail...\", \"partOfSpeech\": \"noun\"}, {\"index\": 6, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"An archaic English unit of length equivalent to 1/20 of an ell or 1/16 of a yard (2 1/4 inches or 5.715 cm).\", \"definitionVi\": \"Tam dich: An archaic English unit of length equivalent to 1/20 of an ell or 1/16 of a yard (2 1/4 in...\", \"partOfSpeech\": \"noun\"}]',4,'Tam dich: A spike-shaped metal fastener used for joining wood or similar materials. The nail is gene...','2026-04-01 02:44:10'),(4,1,'pets',3,'Along Vespucio Sur Avenue, one of the main strips of Santiago, Chile, a massive real estate billboard advertises a new housing complex: “Green areas, barbecue space, pet-friendly sector.” The growing focus on spaces for pets as a major real estate selling point for couples has spread across the region, and the same sign could be seen in Bogotá, Rio de Janeiro, or any other major Latin American city.','[{\"index\": 0, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"An animal kept as a companion.\", \"definitionVi\": \"Tam dich: An animal kept as a companion.\", \"partOfSpeech\": \"noun\"}, {\"index\": 1, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"(by extension) Something kept as a companion, including inanimate objects. (pet rock, pet plant, etc.)\", \"definitionVi\": \"Tam dich: (by extension) Something kept as a companion, including inanimate objects. (pet rock, pet...\", \"partOfSpeech\": \"noun\"}, {\"index\": 2, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"One who is excessively loyal to a superior.\", \"definitionVi\": \"Tam dich: One who is excessively loyal to a superior.\", \"partOfSpeech\": \"noun\"}, {\"index\": 3, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Any person or animal especially cherished and indulged; a darling.\", \"definitionVi\": \"Tam dich: Any person or animal especially cherished and indulged; a darling.\", \"partOfSpeech\": \"noun\"}, {\"index\": 4, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"To stroke or fondle (an animal).\", \"definitionVi\": \"Tam dich: To stroke or fondle (an animal).\", \"partOfSpeech\": \"verb\"}, {\"index\": 5, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"To stroke or fondle (another person) amorously.\", \"definitionVi\": \"Tam dich: To stroke or fondle (another person) amorously.\", \"partOfSpeech\": \"verb\"}, {\"index\": 6, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Of two or more people, to stroke and fondle one another amorously.\", \"definitionVi\": \"Tam dich: Of two or more people, to stroke and fondle one another amorously.\", \"partOfSpeech\": \"verb\"}, {\"index\": 7, \"example\": \"His daughter was petted and spoiled.\", \"contextMatch\": false, \"definitionEn\": \"To treat as a pet; to fondle; to indulge.\", \"definitionVi\": \"Tam dich: To treat as a pet; to fondle; to indulge.\", \"partOfSpeech\": \"verb\"}, {\"index\": 8, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"To be a pet.\", \"definitionVi\": \"Tam dich: To be a pet.\", \"partOfSpeech\": \"verb\"}, {\"index\": 9, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"To be peevish; to sulk.\", \"definitionVi\": \"Tam dich: To be peevish; to sulk.\", \"partOfSpeech\": \"verb\"}, {\"index\": 10, \"example\": \"\", \"contextMatch\": true, \"definitionEn\": \"A fit of petulance, a sulk, arising from the impression that one has been offended or slighted.\", \"definitionVi\": \"Tam dich: A fit of petulance, a sulk, arising from the impression that one has been offended or slig...\", \"partOfSpeech\": \"noun\"}, {\"index\": 11, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"A term of endearment usually applied to women and children.\", \"definitionVi\": \"Tam dich: A term of endearment usually applied to women and children.\", \"partOfSpeech\": \"noun\"}]',10,'Tam dich: A fit of petulance, a sulk, arising from the impression that one has been offended or slig...','2026-04-01 02:45:21'),(5,1,'decade',3,'“In Chile, teenage pregnancy rates have dropped by nearly 80% over the past decade, a public health achievement linked to policies promoting reproductive autonomy and greater access to contraception,” she explains.','[{\"index\": 0, \"example\": \"a decade of soldiers\", \"contextMatch\": false, \"definitionEn\": \"A group, set, or series of ten , particularly:\", \"definitionVi\": \"Tam dich: A group, set, or series of ten , particularly:\", \"partOfSpeech\": \"noun\"}, {\"index\": 1, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"A set of resistors, capacitors, etc. connected so as to provide even increments between one and ten times a base electrical resistance.\", \"definitionVi\": \"Tam dich: A set of resistors, capacitors, etc. connected so as to provide even increments between on...\", \"partOfSpeech\": \"noun\"}, {\"index\": 2, \"example\": \"There are decades between 1.8 and 18, between 25 and 250 and between 0.03 and 0.003.\", \"contextMatch\": true, \"definitionEn\": \"The interval between any two quantities having a ratio of 10 to 1.\", \"definitionVi\": \"Tam dich: The interval between any two quantities having a ratio of 10 to 1.\", \"partOfSpeech\": \"noun\"}]',2,'Tam dich: The interval between any two quantities having a ratio of 10 to 1.','2026-04-01 02:46:23'),(6,1,'nation',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a large group of people who share the same language, culture, and history and live in a particular area\", \"definitionVi\": \"một nhóm người lớn chia sẻ cùng ngôn ngữ, văn hóa và lịch sử và sống trong một khu vực nhất định\", \"partOfSpeech\": \"noun\"}]',0,'một nhóm người lớn chia sẻ cùng ngôn ngữ, văn hóa và lịch sử và sống trong một khu vực nhất định','2026-04-12 10:59:32'),(7,1,'humanization',3,'The growing humanization of pets in households across Latin America and the Caribbean is perhaps the most tangible symptom of a new generational change. Motherhood is no longer a presumed role, and birth rates are falling at an unprecedented pace.','[{\"index\": 0, \"example\": \"The growing humanization of pets in households across Latin America and the Caribbean is perhaps the most tangible symptom of a new generational change. Motherhood is no longer a presumed role, and birth rates are falling at an unprecedented pace.\", \"contextMatch\": true, \"definitionEn\": \"the process of making something more human or treating it as if it were human\", \"definitionVi\": \"quá trình làm cho một cái gì đó trở nên nhân văn hơn hoặc đối xử với nó như thể nó là con người\", \"partOfSpeech\": \"noun\"}]',0,'quá trình làm cho một cái gì đó trở nên nhân văn hơn hoặc đối xử với nó như thể nó là con người','2026-04-12 12:31:19'),(8,1,'address',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a formal speech or written statement given to an audience\", \"definitionVi\": \"một bài phát biểu hoặc tuyên bố chính thức được đưa ra trước một khán giả\", \"partOfSpeech\": \"noun\"}]',0,'một bài phát biểu hoặc tuyên bố chính thức được đưa ra trước một khán giả','2026-04-13 22:53:38'),(9,1,'deliver',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"to give a formal speech or presentation to an audience\", \"definitionVi\": \"đưa ra một bài phát biểu hoặc trình bày chính thức trước khán giả\", \"partOfSpeech\": \"verb\"}]',0,'đưa ra một bài phát biểu hoặc trình bày chính thức trước khán giả','2026-04-14 15:03:56'),(10,1,'neighborhoods',3,'In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i','[{\"index\": 0, \"example\": \"In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i\", \"contextMatch\": true, \"definitionEn\": \"a district or area within a city or town where people live.\", \"definitionVi\": \"một khu vực hoặc khu phố trong thành phố hoặc thị trấn nơi mọi người sinh sống.\", \"partOfSpeech\": \"noun\"}]',0,'một khu vực hoặc khu phố trong thành phố hoặc thị trấn nơi mọi người sinh sống.','2026-04-14 16:06:53');
/*!40000 ALTER TABLE `lookup_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `premium_audit_logs`
--

DROP TABLE IF EXISTS `premium_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_audit_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `transaction_id` bigint(20) DEFAULT NULL,
  `subscription_id` int(11) DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_before` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_after` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `admin_actor` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_premium_audit_user_id` (`user_id`),
  KEY `idx_premium_audit_transaction_id` (`transaction_id`),
  KEY `idx_premium_audit_subscription_id` (`subscription_id`),
  KEY `idx_premium_audit_action` (`action`),
  KEY `idx_premium_audit_created_at` (`created_at`),
  CONSTRAINT `fk_premium_audit_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`),
  CONSTRAINT `fk_premium_audit_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`),
  CONSTRAINT `fk_premium_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premium_audit_logs`
--

LOCK TABLES `premium_audit_logs` WRITE;
/*!40000 ALTER TABLE `premium_audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `premium_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `premium_feature_limits`
--

DROP TABLE IF EXISTS `premium_feature_limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_feature_limits` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) DEFAULT NULL,
  `feature_name` varchar(100) NOT NULL,
  `is_locked` tinyint(1) DEFAULT '0',
  `usage_limit` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_plan_feature_limits` (`plan_id`),
  CONSTRAINT `fk_plan_feature_limits` FOREIGN KEY (`plan_id`) REFERENCES `premium_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premium_feature_limits`
--

LOCK TABLES `premium_feature_limits` WRITE;
/*!40000 ALTER TABLE `premium_feature_limits` DISABLE KEYS */;
INSERT INTO `premium_feature_limits` VALUES (50,3,'SAVED_VOCABULARY',0,50),(51,3,'ARTICLE_DOWNLOADS',0,0),(52,3,'VIDEO_TRANSCRIPT_DOWNLOADS',1,0),(53,3,'SAVED_ARTICLES',1,10),(54,3,'CUSTOM_VOCABULARY_SETS',1,2),(55,3,'MONTHLY_VOCABULARY_TESTS',1,5),(56,3,'VOCABULARY_REVIEW',1,0);
/*!40000 ALTER TABLE `premium_feature_limits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `premium_plans`
--

DROP TABLE IF EXISTS `premium_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID gói Premium',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL COMMENT 'Thời hạn (ngày)',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả gói',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premium_plans`
--

LOCK TABLES `premium_plans` WRITE;
/*!40000 ALTER TABLE `premium_plans` DISABLE KEYS */;
INSERT INTO `premium_plans` VALUES (3,'zxxxxxxx',22222.00,23,'eee');
/*!40000 ALTER TABLE `premium_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_history`
--

DROP TABLE IF EXISTS `review_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người học',
  `vocab_id` int(11) DEFAULT NULL COMMENT 'Từ hệ thống',
  `custom_vocab_id` int(11) DEFAULT NULL COMMENT 'Từ user',
  `is_correct` tinyint(1) DEFAULT NULL COMMENT 'Đúng/Sai',
  `response_time` float DEFAULT NULL COMMENT 'Thời gian trả lời',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
  `session_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vocab_id` (`vocab_id`),
  KEY `custom_vocab_id` (`custom_vocab_id`),
  KEY `idx_review_user` (`user_id`),
  KEY `FK78njllox2dutt13g7whss9mh2` (`session_id`),
  CONSTRAINT `FK78njllox2dutt13g7whss9mh2` FOREIGN KEY (`session_id`) REFERENCES `review_sessions` (`id`),
  CONSTRAINT `review_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `review_history_ibfk_2` FOREIGN KEY (`vocab_id`) REFERENCES `vocabulary` (`id`),
  CONSTRAINT `review_history_ibfk_3` FOREIGN KEY (`custom_vocab_id`) REFERENCES `user_vocabulary_custom` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_history`
--

LOCK TABLES `review_history` WRITE;
/*!40000 ALTER TABLE `review_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_sessions`
--

DROP TABLE IF EXISTS `review_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người học',
  `total_questions` int(11) DEFAULT NULL COMMENT 'Tổng câu hỏi',
  `correct_answers` int(11) DEFAULT NULL COMMENT 'Số câu đúng',
  `accuracy` float DEFAULT NULL COMMENT 'Độ chính xác',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `review_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_sessions`
--

LOCK TABLES `review_sessions` WRITE;
/*!40000 ALTER TABLE `review_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `segments`
--

DROP TABLE IF EXISTS `segments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `segments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `segment_order` bigint(20) DEFAULT NULL COMMENT 'Thứ tự segment',
  `start_sec` double DEFAULT NULL COMMENT 'Thời gian bắt đầu (giây)',
  `end_sec` double DEFAULT NULL COMMENT 'Thời gian kết thúc (giây)',
  `text` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung phụ đề',
  `video_id` bigint(20) DEFAULT NULL COMMENT 'Video ID',
  PRIMARY KEY (`id`),
  KEY `video_id` (`video_id`),
  CONSTRAINT `segments_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `segments`
--

LOCK TABLES `segments` WRITE;
/*!40000 ALTER TABLE `segments` DISABLE KEYS */;
/*!40000 ALTER TABLE `segments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spaced_config`
--

DROP TABLE IF EXISTS `spaced_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spaced_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `beta_0` float DEFAULT '2.5' COMMENT 'Bias',
  `beta_1` float DEFAULT '1' COMMENT 'Trọng số streak',
  `beta_2` float DEFAULT '0.5' COMMENT 'Trọng số thời gian',
  `beta_3` float DEFAULT '0.8' COMMENT 'Trọng số độ khó',
  `beta_4` float DEFAULT '0.5' COMMENT 'Trọng số thời gian phản hồi',
  `K` int(11) DEFAULT '10' COMMENT 'Hệ số smoothing',
  `max_interval` int(11) DEFAULT '30' COMMENT 'Khoảng ôn tối đa (ngày)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spaced_config`
--

LOCK TABLES `spaced_config` WRITE;
/*!40000 ALTER TABLE `spaced_config` DISABLE KEYS */;
INSERT INTO `spaced_config` VALUES (1,2.5,1,0.5,0.8,10,30,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `spaced_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_responses`
--

DROP TABLE IF EXISTS `support_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_responses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) DEFAULT NULL COMMENT 'Ticket liên quan',
  `admin_id` int(11) DEFAULT NULL COMMENT 'Admin phản hồi',
  `response` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `support_responses_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`),
  CONSTRAINT `support_responses_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_responses`
--

LOCK TABLES `support_responses` WRITE;
/*!40000 ALTER TABLE `support_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID ticket',
  `user_id` int(11) DEFAULT NULL COMMENT 'Người gửi',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tiêu đề',
  `message` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID chủ đề',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả',
  `level` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1' COMMENT 'Trạng thái hoạt động',
  `created_at` datetime(6) DEFAULT NULL,
  `topic_image` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES (3,'Từ vựng','Mô tả','Cơ bản',1,'2026-03-23 15:35:33.761114',NULL);
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người thanh toán',
  `subscription_id` int(11) DEFAULT NULL COMMENT 'Gói liên quan',
  `amount` decimal(38,2) DEFAULT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian giao dịch',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `subscription_id` (`subscription_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_article_progress`
--

DROP TABLE IF EXISTS `user_article_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_article_progress` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `article_id` bigint(20) NOT NULL,
  `progress` float DEFAULT '0',
  `last_read_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_article` (`user_id`,`article_id`),
  KEY `fk_progress_article` (`article_id`),
  CONSTRAINT `fk_progress_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_article_progress`
--

LOCK TABLES `user_article_progress` WRITE;
/*!40000 ALTER TABLE `user_article_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_article_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_profile`
--

DROP TABLE IF EXISTS `user_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Liên kết với Users (1-1)',
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh đại diện',
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profile`
--

LOCK TABLES `user_profile` WRITE;
/*!40000 ALTER TABLE `user_profile` DISABLE KEYS */;
INSERT INTO `user_profile` VALUES (1,1,'Nguyen Minh The',NULL,NULL);
/*!40000 ALTER TABLE `user_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_stats`
--

DROP TABLE IF EXISTS `user_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stats` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người dùng',
  `total_words` int(11) DEFAULT NULL COMMENT 'Tổng số từ',
  `learned_words` int(11) DEFAULT NULL COMMENT 'Số từ đã học',
  `accuracy` float DEFAULT NULL COMMENT 'Độ chính xác',
  `streak_days` int(11) DEFAULT NULL COMMENT 'Số ngày học liên tiếp',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stats`
--

LOCK TABLES `user_stats` WRITE;
/*!40000 ALTER TABLE `user_stats` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_subscriptions`
--

DROP TABLE IF EXISTS `user_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID đăng ký',
  `user_id` int(11) NOT NULL COMMENT 'Người đăng ký',
  `plan_id` int(11) NOT NULL COMMENT 'Gói Premium',
  `start_date` datetime DEFAULT NULL COMMENT 'Ngày bắt đầu',
  `end_date` datetime DEFAULT NULL COMMENT 'Ngày kết thúc',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `premium_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_subscriptions`
--

LOCK TABLES `user_subscriptions` WRITE;
/*!40000 ALTER TABLE `user_subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_vocabulary_custom`
--

DROP TABLE IF EXISTS `user_vocabulary_custom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_vocabulary_custom` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID từ tự thêm',
  `user_id` int(11) DEFAULT NULL COMMENT 'Người tạo',
  `word` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pronunciation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `part_of_speech` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meaning_en` text COLLATE utf8mb4_unicode_ci COMMENT 'Nghĩa tiếng Anh',
  `meaning_vi` text COLLATE utf8mb4_unicode_ci COMMENT 'Nghĩa tiếng Việt',
  `example` text COLLATE utf8mb4_unicode_ci COMMENT 'Ví dụ',
  `example_vi` text COLLATE utf8mb4_unicode_ci,
  `level` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level_source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phonetic` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  `updated_at` datetime DEFAULT NULL,
  `source_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_vocabulary_custom_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vocabulary_custom`
--

LOCK TABLES `user_vocabulary_custom` WRITE;
/*!40000 ALTER TABLE `user_vocabulary_custom` DISABLE KEYS */;
INSERT INTO `user_vocabulary_custom` VALUES (1,1,'central','/ˈsɛntɹəl/','adjective','Being in the centre.','Tam dich: Being in the centre.','',NULL,'2026-04-01 02:28:20',NULL,NULL);
/*!40000 ALTER TABLE `user_vocabulary_custom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_vocabulary_learning`
--

DROP TABLE IF EXISTS `user_vocabulary_learning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_vocabulary_learning` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'Người học',
  `vocab_id` int(11) DEFAULT NULL COMMENT 'Từ hệ thống',
  `custom_vocab_id` int(11) DEFAULT NULL COMMENT 'Từ tự thêm',
  `streak_correct` int(11) DEFAULT '0' COMMENT 'Số lần trả lời đúng liên tiếp',
  `last_review` datetime DEFAULT NULL COMMENT 'Lần ôn gần nhất',
  `next_review` datetime DEFAULT NULL COMMENT 'Lịch ôn tiếp theo',
  `difficulty` float DEFAULT '2.5' COMMENT 'Độ khó hiện tại',
  `base_difficulty` float DEFAULT '2.5' COMMENT 'Độ khó ban đầu',
  `total_attempts` int(11) DEFAULT '0' COMMENT 'Tổng số lần học',
  `total_errors` int(11) DEFAULT '0' COMMENT 'Số lần sai',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`vocab_id`),
  UNIQUE KEY `user_id_2` (`user_id`,`custom_vocab_id`),
  KEY `vocab_id` (`vocab_id`),
  KEY `custom_vocab_id` (`custom_vocab_id`),
  KEY `idx_user_next_review` (`user_id`,`next_review`),
  KEY `idx_user_vocab` (`user_id`,`vocab_id`),
  CONSTRAINT `user_vocabulary_learning_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_vocabulary_learning_ibfk_2` FOREIGN KEY (`vocab_id`) REFERENCES `vocabulary` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_vocabulary_learning_ibfk_3` FOREIGN KEY (`custom_vocab_id`) REFERENCES `user_vocabulary_custom` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vocabulary_learning`
--

LOCK TABLES `user_vocabulary_learning` WRITE;
/*!40000 ALTER TABLE `user_vocabulary_learning` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_vocabulary_learning` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID người dùng',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên đăng nhập (duy nhất)',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email người dùng',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mật khẩu đã mã hóa',
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Trạng thái hoạt động',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo tài khoản',
  `deleted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'nguyenminhthe2hk4','nguyenminhthe2hk4@gmail.com','$2a$10$PzfFkaZVS7EeFQPjQ2c6leA./i2RbNarjIMRzXy07PT.UVJEH.TaS','ADMIN',1,'2026-03-24 15:45:46',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tiêu đề',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Link video',
  `transcript` text COLLATE utf8mb4_unicode_ci COMMENT 'Phụ đề video',
  `channel_id` int(11) DEFAULT NULL COMMENT 'Kênh YouTube',
  `difficulty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `words_highlighted` int(11) NOT NULL DEFAULT '0',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `channel_id` (`channel_id`),
  CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`channel_id`) REFERENCES `youtube_channels` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (24,'cc','https://www.youtube.com/api/timedtext?v=noQHzap_5ac&fmt=json3','',1,'Trung bình','—',0,'Chờ biên tập'),(27,'ff','https://youtu.be/ATawgx_kALA?si=e1SdANGtoKQ7J9Iv','',1,'Trung bình','—',0,'Chờ biên tập'),(28,'zzz','https://youtu.be/ATawgx_kALA?si=e1SdANGtoKQ7J9Iv','',1,'Trung bình','—',0,'Chờ biên tập'),(29,'Verification Video','https://youtu.be/ATawgx_kALA','',1,'Trung bình','—',0,'Chờ biên tập'),(30,'ss','https://youtu.be/ATawgx_kALA?si=e1SdANGtoKQ7J9Iv','',1,'Trung bình','—',0,'Chờ biên tập'),(31,'aa','https://youtu.be/ATawgx_kALA?si=e1SdANGtoKQ7J9Iv','',1,'Trung bình','—',0,'Chờ biên tập');
/*!40000 ALTER TABLE `videos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vocabulary`
--

DROP TABLE IF EXISTS `vocabulary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vocabulary` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID từ vựng',
  `word` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pronunciation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `part_of_speech` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meaning_en` text COLLATE utf8mb4_unicode_ci COMMENT 'Định nghĩa tiếng Anh',
  `meaning_vi` text COLLATE utf8mb4_unicode_ci COMMENT 'Nghĩa tiếng Việt',
  `example` text COLLATE utf8mb4_unicode_ci COMMENT 'Câu ví dụ',
  `example_vi` text COLLATE utf8mb4_unicode_ci,
  `level` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` bit(1) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `word` (`word`),
  KEY `idx_vocab_word` (`word`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vocabulary`
--

LOCK TABLES `vocabulary` WRITE;
/*!40000 ALTER TABLE `vocabulary` DISABLE KEYS */;
INSERT INTO `vocabulary` VALUES (1,'come','/kʌm/','noun','go to somewhere','đến','he comes',NULL,'Cơ bản',_binary '','2026-03-23 15:36:28'),(2,'communication','/kəˌmjuːnɪˈkeɪʃən/','noun','ihi','ihewoi','eeee',NULL,'Trung bình',NULL,NULL);
/*!40000 ALTER TABLE `vocabulary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `youtube_channels`
--

DROP TABLE IF EXISTS `youtube_channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `youtube_channels` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID kênh',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên kênh',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Link kênh',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả kênh',
  `subscriber_count` int(11) DEFAULT NULL COMMENT 'Số lượng subscriber',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày lưu',
  `handle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `focus_topic` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `youtube_channels`
--

LOCK TABLES `youtube_channels` WRITE;
/*!40000 ALTER TABLE `youtube_channels` DISABLE KEYS */;
INSERT INTO `youtube_channels` VALUES (1,'BBC Learning English','https://www.youtube.com/@bbc','General',NULL,NULL,NULL,NULL,1);
/*!40000 ALTER TABLE `youtube_channels` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-15 22:26:16
