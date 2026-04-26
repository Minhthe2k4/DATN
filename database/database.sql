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
  `article_topic_image` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_topics_deleted_at` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_topics`
--

LOCK TABLES `article_topics` WRITE;
/*!40000 ALTER TABLE `article_topics` DISABLE KEYS */;
INSERT INTO `article_topics` VALUES (1,'Daily News','Hay','Trung bình',1,'',NULL),(2,'Good news','Good','Cơ bản',1,'',NULL);
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
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `topic_id` (`topic_id`),
  KEY `idx_articles_deleted_at` (`deleted_at`),
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `article_topics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (2,'Live updates: US gas hits $4 as Trump tells other nations to ‘go get your own oil’ | CNN','• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\n\n• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.\n\n• US tech companies threatened: Apple, Microsoft, Google, Meta, IBM, HP, Intel and Tesla are among the 17 American companies Tehran has threatened to attack if more Iranian leaders are killed, according to the semi-official outlet Fars.','https://edition.cnn.com/2026/03/31/world/live-news/iran-war-us-trump-oil',2,'2026-03-31 11:57:00','Trung bình',5,'Đã xuất bản','https://media.cnn.com/api/v1/images/stellar/prod/03-2026-03-04t182121z-2122628346-rc24vjaejhvb-rtrmadp-3-iran-crisis-1.jpg?c=16x9&q=w_800,c_fill',NULL),(3,'Latin America’s generational shift: What’s causing record-low birth rates across the region? | CNN','<figure class=\"article-inline-image\"><img src=\"https://media.cnn.com/api/v1/images/stellar/prod/c-gettyimages-1860795492.jpg?c=original&amp;q=w_1041\" alt=\"People walk along Alameda Avenue at sunset in Santiago on December 19, 2023.\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><figcaption class=\"article-inline-caption\">Lee este artículo en español</figcaption><p>Along Vespucio Sur Avenue, one of the main strips of Santiago, Chile, a massive real estate billboard advertises a new housing complex: “Green areas, barbecue space, pet-friendly sector.” The growing focus on spaces for pets as a major real estate selling point for couples has spread across the region, and the same sign could be seen in Bogotá, Rio de Janeiro, or any other major Latin American city.</p><p>In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same is true in Quito, Ecuador.</p><p>The growing humanization of pets in households across Latin America and the Caribbean is perhaps the most tangible symptom of a new generational change. Motherhood is no longer a presumed role, and birth rates are falling at an unprecedented pace.</p><p>The data comes from the latest Demographic Observatory by ECLAC (the UN Economic Commission for Latin America and the Caribbean), focused on declining fertility. Latin America now averages 1.8 children per woman, below the replacement level of 2.1 needed to sustain a stable population. Compare that to the 1950s, when Latin American women had an average of 5.8 children.</p><p>Simone Cecchini, director of the Latin American and Caribbean Demographic Center at ECLAC, told CNN the change has been much faster than in Europe. “It even exceeded what the United Nations projected two decades ago.”</p><p>“According to our estimates, the total population of Latin America and the Caribbean will grow until 2053 and, from then on, will begin to decline on average,” Cecchini says. Some countries and territories are already experiencing this – Cuba and Uruguay have declining populations, as do several Caribbean islands.</p><h2>Teen pregnancies</h2><p>Every morning, on her way to the Pontifical Catholic University of Chile, sociologist Martina Yopo Díaz looks at the Vespucio Sur housing billboard as symptomatic of how “children, and reproduction in a broader sense, are occupying an increasingly marginal place in the life projects of younger generations.”</p><p>In demography, a fertility rate below 1.3 children per woman is considered ultra-low. Chile’s rate has fallen to 1.1 children per woman, the lowest in Latin America and among the lowest in the world, according to ECLAC data. Costa Rica (1.32), Uruguay (1.39) and Argentina (1.5) are not far behind, while several Caribbean countries are also at ultra-low levels.</p><p>While Yopo Díaz describes it as a “multi-causal phenomenon,” a key change has been a decline in teenage pregnancies.</p><p>“In Chile, teenage pregnancy rates have dropped by nearly 80% over the past decade, a public health achievement linked to policies promoting reproductive autonomy and greater access to contraception,” she explains.</p><p>Similar trends have occurred across Latin America. According to ECLAC, there were 70 live births per 1,000 women aged 15 to 19 in 2014. That figure dropped to around 50 in 2024.</p><p>Even so, teen pregnancy rates in Latin America and the Caribbean remain higher than in any other region of the world except Africa.</p><h2>Link to inequality</h2><p>In a region marked by inequality, the decline in birth rates does not affect all groups equally. According to Cecchini, studies show that lower-income women tend to have more children than they would like, while higher-income women tend to have fewer than they want.</p><p>Motherhood can also widen the gap between the two groups because it is more likely to be a barrier to employment for women from lower-income families, who are less likely to be able to afford childcare.</p><p>Education also plays a role, with more educated women tending to have fewer children. According to Our World in Data, Mexican women had an average of 3.4 children and 6.4 years of schooling in 1990; by 2020, they had 1.9 children and more than 10 years of schooling. Similar trends can be seen in Colombia, Brazil, and elsewhere.</p><p>As Cecchini puts it, “Women’s participation in the work force, gender inequality, and fertility form a very complex knot.”</p><h2>Can the trend be reversed?</h2><p>Experts tend to be cautious. Globally, countries that have implemented pro-natalist policies – bonuses, generous parental leave – have achieved, at best, modest or temporary increases.</p><p>“In Europe, what we’ve seen is that these policies often bring forward the age at which women have children,” says Cecchini.</p><p>This is not insignificant, as delaying parenthood tends to affect the number of children a mother has. However, as Yopo Díaz points out, “there are people who will not want to have children, regardless of policies.”</p><figure class=\"article-inline-image\"><img src=\"https://media.cnn.com/api/v1/images/stellar/prod/c-gettyimages-2258175014.jpg?c=original&amp;q=w_860\" alt=\"A man and a child ride bicycles in the Bicentenario Park in Santiago on January 28, 2026.\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><p>What policymakers can do, she argues, is make things easier for those people who do want to be parents but feel they lack the money, time, or stability.</p><p>Rather than fixate on the question of how many children are being born, she suggests focusing on building a society in which “the decision to have children is not a burden for one particular group, especially for women.”</p><h2>Aging populations</h2><p>Falling birth rates coupled with rising life expectancies result in aging populations, which in turn strain economic growth, healthcare and benefit systems as a smaller pool of working age people are required to support, through taxes, a growing pool of retirees.</p><p>It’s a shift that is visible in everyday life.</p><p>In Chile, Yopo Díaz says, there is increasing discussion about the closure of maternity wards due to lower demand. In Argentina, headlines report school closures due to declining enrollment.</p><p>A report by Argentinos por la Educación estimates that by 2030, school enrollment could drop by 27% nationwide; in Uruguay, official figures show 15% fewer students aged 3 to 17 compared to three decades ago with projections heading downward. At the regional level, data from UNESCO and the International Institute for Educational Planning indicate that between 2015 and 2023 there were 1.2 million fewer births, and that by 2030 there will be 11.5 million fewer school-age children and teenagers than in 2020.</p><p>Where some see a problem, others see an opportunity. While some experts fear aging societies are storing up economic problems, others say there could be unexpected boons. For instance, they say, if there are fewer children, governments and families could invest more per student.</p><p>Still, most experts agree that if societies are to design effective policies then the complexity of the situation must be acknowledged.</p><p>There is no single reason for declining fertility, they say, but a mesh of overlapping layers – health and education policies, economic disparities, new gender expectations, and a cultural climate in which “having children” is no longer a mandatory box to check.</p>','https://edition.cnn.com/2026/03/31/americas/latin-america-birth-rates-fall-latam-intl',1,'2026-03-31 12:12:00','Trung bình',14,'Đã xuất bản','https://media.cnn.com/api/v1/images/stellar/prod/c-gettyimages-1860795492.jpg?c=16x9&q=w_800',NULL),(4,'Watch Bruce the parrot defeat his rivals with only half a beak','<ul><li>ANIMALS</li></ul><p>While the kea parrot’s beak would normally be considered essential for survival, Bruce has innovated other ways of commanding respect.</p><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/e25bfed5-f69a-4bb6-8f95-18e0a2547515/f8ae4021-18af-4843-8951-02981a1f47a4.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><p>Kea parrots are known for being extremely curious and capable of solving complex problems ; they can even make each other chuckle . Now, for the first time, a kea named Bruce has demonstrated skilled combat techniques after losing his upper beak.  </p><p>Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand. These olive-green parrots have fiery orange feathers under their wings and live in the mountains of New Zealand’s South Island.</p><p>To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group. Their findings, published in the journal Current Biology , reveal that Bruce uses a novel jousting-like attack with his feet and lower beak to vanquish rivals.</p><p>“I think it’s very clear that Bruce has made the most of his half-beak,” says Amalia Bastos , a comparative psychologist at the University of St. Andrews in Scotland who was not involved in the study. “He might never have survived in the wild, but in captivity he has managed to innovate new behaviors to displace other birds.”</p><figcaption class=\"article-inline-caption\">( These parrots can make other parrots &amp;#x27;laugh&amp;#x27;—a first )</figcaption><h2>A precocious parrot  </h2><p>An endangered species, the crow-size kea are found only in New Zealand. Their cleverness sometimes manifests itself in “cheeky behaviors” like stealing shiny objects and gnawing on windshield wipers, says biologist Alex Grabham , a postdoctoral research fellow at the University of Canterbury and the lead author of the paper.  </p><p>The kea’s sharp, curved beak ordinarily serves as their essential built-in Swiss army knife. The parrots use their beaks to pry things open, preen their feathers and pick off parasites. “Losing it would likely make survival in the wild very difficult,” says Alice Auersperg , a cognitive biologist at the University of Veterinary Medicine Vienna who studies intelligence in parrots but was not involved in the research.</p><p>  Bruce lost his upper beak when he was a juvenile, possibly after a run-in with a rat trap. The injured parrot was rescued by the New Zealand Department of Conservation and brought to Willowbank’s aviary. Over more than a decade in captivity, Bruce has shown a knack for coming up with new behaviors to compensate for his missing beak. For example, Bastos and her colleagues observed Bruce sticking pebbles between his tongue and lower beak to preen his feathers .</p><figcaption class=\"article-inline-caption\">( Crows and parrots—brainy birds, but in different ways )</figcaption><h2>Champion of the circus</h2><p>Some scientists and keepers wondered if Bruce’s ingenuity may also benefit his social standing. Grabham and his colleagues recently analyzed years-worth of observational data on Bruce’s interactions with the eight other male kea living at Willowbank.</p><p>Over the span of 12 years, Bruce duked it out with the other males on 36 occasions. Despite being the only parrot in the circus lacking an upper beak, Bruce came out victorious every time. The scientists recorded videos of these interactions, allowing them to closely analyze Bruce’s attack.</p><h2>You May Also Like</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/6d7d7cdf-629b-469c-91a5-8bb127af9e05/NPL_01712224_square.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>A clever cockatoo picked up a human skill—and then it spread</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/a71d4a31-e2e7-4cc9-b5bd-42804ce45d6b/MM10198_770A5526_FINAL_square.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>What happens to exotic pets that outlive their owners?</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/0c512803-c985-4d7e-9ea0-b9ebf6630770/naturepl_01625840_square.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>How a penguin ‘divorce’ can impact a whole colony</h2><p>Whereas most kea tried to bite their opponents’ necks with their large beaks, Bruce exhibited a novel long-range attack. He ran and jumped at the other parrot with his clawed feet sticking out. The movement reminded Grabham of a jousting knight riding a horse. The other kea at Willowbank struggled to stop their jousting counterpart. The scientists discovered that Bruce’s jousting move knocked his opponents off balance during nearly 75 percent of his battles.  </p><p>Once Bruce had a parrot on its heels, his dagger-like lower beak finished the job. Like a boxer peppering an opponent with jabs, Bruce used the remaining part of his beak to strike opponents in the back, head, wings and feet.  </p><p>To add context to Bruce’s success on the battlefield, the team also investigated the various parrots’ hormones. The scientists collected poop from each kea and pinpointed traces of glucocorticoid metabolites, a hormone commonly linked to readiness or stress. Of all the kea studied, Bruce had the lowest levels of the hormone.</p><p>The finding surprised Bastos. “You would have expected the dominant individual to experience the most stress trying to maintain their position,” she said.</p><h2>Perks of innovation  </h2><p>Scientists say Bruce’s dominance allowed him to live a stress-free existence as Willowbank’s alpha kea. He was the only parrot in his circus to receive preening from other male parrots, who picked at debris surrounding Bruce’s lower beak and head. Additionally, Bruce was often the first to arrive at the feeding stations, was never challenged while eating and sometimes took sole custody of a feeding station for 15 minutes at a time.  </p><p>Bruce is not the only known case of a seemingly disabled animal achieving social success. Some examples include Faben, a chimpanzee who lost the use of his arm due to polio —which was documented by the late primatologist Jane Goodall —and an elderly Japanese macaque that could no longer walk . However, these primates were aided by alliances with siblings and mates. Bruce, on the other hand, was able to achieve success on his own.</p><p>Auersperg thinks it is possible that other species of parrots could also be capable of overcoming the challenges presented by a missing beak. “Bruce is an extreme case, but the broader pattern may translate,” she says, mentioning anecdotal reports of captive parrots with similar injuries using their lower beak like a shovel to scoop up food.  </p><p>It is unclear if Bruce’s jousting technique would work in the wild, however. In captivity, Bruce interacts with only a small number of parrots. “In the wild, Bruce has a better chance of crossing paths with a bird that could figure him out,” Grabham says.</p><p>Grabham thinks the new findings provide interesting insights into caring for captive animals. For example, Bruce shows that replacing missing body parts with prosthetics may not always benefit an animal. If Bruce was equipped with a prosthetic beak, he may not have developed his unstoppable jousting attack.</p><p>In this way, Grabham thinks Bruce’s success may tell also us something about ourselves. “We thought that missing a beak would cause him to struggle but I think that&amp;#x27;s probably a prejudice of society&amp;#x27;s view on disabilities,” he says. “We associate disability with struggle and stress, but Bruce shows us it can be the opposite.”</p><h2>Related Topics</h2><ul><li>PARROTS</li><li>ANIMALS</li><li>ANIMAL BEHAVIOR</li><li>WEIRD NATURE</li><li>WEIRD ANIMALS</li></ul><h2>You May Also Like</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/0f78dcaf-8f31-4323-8b83-6061b4a47982/1_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>The surprising hidden glow of one of Earth’s largest birds</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/3387bf6b-f939-427c-8331-64763fe3fd51/P9PXPJ_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>How these parrots went from the tropical jungle to the concrete jungle</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/84b42271-0fc8-4d0f-b730-148bce346910/DSC_4795_Kopie_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>This fish has cloned itself for 100,000 years. Scientists just figured out how.</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/d249ca1e-b7d8-42fb-bbec-f2111472ad4f/52526335693_82c7bcc328_o_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>How New Zealand saved a flightless parrot from extinction</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/216fd32a-4541-4cf0-8903-744cb92f1ff7/BirdFeeders_OG_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>Play to find out which birds dominate at your feeder—and why</h2>','https://www.nationalgeographic.com/animals/article/kea-parrot-bruce-jousting-science',2,'2026-04-21 00:17:00','Trung bình',15,'Đã xuất bản','https://i.natgeofe.com/n/6706b6aa-039c-4911-a6eb-df4435d2ea33/AlexGrabham_16x9.jpg?w=1200','2026-04-21 21:31:33'),(5,'Watch Bruce the parrot defeat his rivals with only half a beak','<ul><li>ANIMALS</li></ul><p>While the kea parrot’s beak would normally be considered essential for survival, Bruce has innovated other ways of commanding respect.</p><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/e25bfed5-f69a-4bb6-8f95-18e0a2547515/f8ae4021-18af-4843-8951-02981a1f47a4.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><p>Kea parrots are known for being extremely curious and capable of solving complex problems ; they can even make each other chuckle . Now, for the first time, a kea named Bruce has demonstrated skilled combat techniques after losing his upper beak.  </p><p>Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand. These olive-green parrots have fiery orange feathers under their wings and live in the mountains of New Zealand’s South Island.</p><p>To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group. Their findings, published in the journal Current Biology , reveal that Bruce uses a novel jousting-like attack with his feet and lower beak to vanquish rivals.</p><p>“I think it’s very clear that Bruce has made the most of his half-beak,” says Amalia Bastos , a comparative psychologist at the University of St. Andrews in Scotland who was not involved in the study. “He might never have survived in the wild, but in captivity he has managed to innovate new behaviors to displace other birds.”</p><figcaption class=\"article-inline-caption\">( These parrots can make other parrots &amp;#x27;laugh&amp;#x27;—a first )</figcaption><h2>A precocious parrot  </h2><p>An endangered species, the crow-size kea are found only in New Zealand. Their cleverness sometimes manifests itself in “cheeky behaviors” like stealing shiny objects and gnawing on windshield wipers, says biologist Alex Grabham , a postdoctoral research fellow at the University of Canterbury and the lead author of the paper.  </p><p>The kea’s sharp, curved beak ordinarily serves as their essential built-in Swiss army knife. The parrots use their beaks to pry things open, preen their feathers and pick off parasites. “Losing it would likely make survival in the wild very difficult,” says Alice Auersperg , a cognitive biologist at the University of Veterinary Medicine Vienna who studies intelligence in parrots but was not involved in the research.</p><p>  Bruce lost his upper beak when he was a juvenile, possibly after a run-in with a rat trap. The injured parrot was rescued by the New Zealand Department of Conservation and brought to Willowbank’s aviary. Over more than a decade in captivity, Bruce has shown a knack for coming up with new behaviors to compensate for his missing beak. For example, Bastos and her colleagues observed Bruce sticking pebbles between his tongue and lower beak to preen his feathers .</p><figcaption class=\"article-inline-caption\">( Crows and parrots—brainy birds, but in different ways )</figcaption><h2>Champion of the circus</h2><p>Some scientists and keepers wondered if Bruce’s ingenuity may also benefit his social standing. Grabham and his colleagues recently analyzed years-worth of observational data on Bruce’s interactions with the eight other male kea living at Willowbank.</p><p>Over the span of 12 years, Bruce duked it out with the other males on 36 occasions. Despite being the only parrot in the circus lacking an upper beak, Bruce came out victorious every time. The scientists recorded videos of these interactions, allowing them to closely analyze Bruce’s attack.</p><h2>You May Also Like</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/6d7d7cdf-629b-469c-91a5-8bb127af9e05/NPL_01712224_square.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>A clever cockatoo picked up a human skill—and then it spread</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/a71d4a31-e2e7-4cc9-b5bd-42804ce45d6b/MM10198_770A5526_FINAL_square.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>What happens to exotic pets that outlive their owners?</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/0c512803-c985-4d7e-9ea0-b9ebf6630770/naturepl_01625840_square.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>How a penguin ‘divorce’ can impact a whole colony</h2><p>Whereas most kea tried to bite their opponents’ necks with their large beaks, Bruce exhibited a novel long-range attack. He ran and jumped at the other parrot with his clawed feet sticking out. The movement reminded Grabham of a jousting knight riding a horse. The other kea at Willowbank struggled to stop their jousting counterpart. The scientists discovered that Bruce’s jousting move knocked his opponents off balance during nearly 75 percent of his battles.  </p><p>Once Bruce had a parrot on its heels, his dagger-like lower beak finished the job. Like a boxer peppering an opponent with jabs, Bruce used the remaining part of his beak to strike opponents in the back, head, wings and feet.  </p><p>To add context to Bruce’s success on the battlefield, the team also investigated the various parrots’ hormones. The scientists collected poop from each kea and pinpointed traces of glucocorticoid metabolites, a hormone commonly linked to readiness or stress. Of all the kea studied, Bruce had the lowest levels of the hormone.</p><p>The finding surprised Bastos. “You would have expected the dominant individual to experience the most stress trying to maintain their position,” she said.</p><h2>Perks of innovation  </h2><p>Scientists say Bruce’s dominance allowed him to live a stress-free existence as Willowbank’s alpha kea. He was the only parrot in his circus to receive preening from other male parrots, who picked at debris surrounding Bruce’s lower beak and head. Additionally, Bruce was often the first to arrive at the feeding stations, was never challenged while eating and sometimes took sole custody of a feeding station for 15 minutes at a time.  </p><p>Bruce is not the only known case of a seemingly disabled animal achieving social success. Some examples include Faben, a chimpanzee who lost the use of his arm due to polio —which was documented by the late primatologist Jane Goodall —and an elderly Japanese macaque that could no longer walk . However, these primates were aided by alliances with siblings and mates. Bruce, on the other hand, was able to achieve success on his own.</p><p>Auersperg thinks it is possible that other species of parrots could also be capable of overcoming the challenges presented by a missing beak. “Bruce is an extreme case, but the broader pattern may translate,” she says, mentioning anecdotal reports of captive parrots with similar injuries using their lower beak like a shovel to scoop up food.  </p><p>It is unclear if Bruce’s jousting technique would work in the wild, however. In captivity, Bruce interacts with only a small number of parrots. “In the wild, Bruce has a better chance of crossing paths with a bird that could figure him out,” Grabham says.</p><p>Grabham thinks the new findings provide interesting insights into caring for captive animals. For example, Bruce shows that replacing missing body parts with prosthetics may not always benefit an animal. If Bruce was equipped with a prosthetic beak, he may not have developed his unstoppable jousting attack.</p><p>In this way, Grabham thinks Bruce’s success may tell also us something about ourselves. “We thought that missing a beak would cause him to struggle but I think that&amp;#x27;s probably a prejudice of society&amp;#x27;s view on disabilities,” he says. “We associate disability with struggle and stress, but Bruce shows us it can be the opposite.”</p><h2>Related Topics</h2><ul><li>PARROTS</li><li>ANIMALS</li><li>ANIMAL BEHAVIOR</li><li>WEIRD NATURE</li><li>WEIRD ANIMALS</li></ul><h2>You May Also Like</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/0f78dcaf-8f31-4323-8b83-6061b4a47982/1_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>The surprising hidden glow of one of Earth’s largest birds</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/3387bf6b-f939-427c-8331-64763fe3fd51/P9PXPJ_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>How these parrots went from the tropical jungle to the concrete jungle</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/84b42271-0fc8-4d0f-b730-148bce346910/DSC_4795_Kopie_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>This fish has cloned itself for 100,000 years. Scientists just figured out how.</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/d249ca1e-b7d8-42fb-bbec-f2111472ad4f/52526335693_82c7bcc328_o_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>How New Zealand saved a flightless parrot from extinction</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/216fd32a-4541-4cf0-8903-744cb92f1ff7/BirdFeeders_OG_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>Play to find out which birds dominate at your feeder—and why</h2>','https://www.nationalgeographic.com/animals/article/kea-parrot-bruce-jousting-science',1,'2026-04-21 14:32:00','Trung bình',15,'Chờ biên tập','https://i.natgeofe.com/n/6706b6aa-039c-4911-a6eb-df4435d2ea33/AlexGrabham_16x9.jpg?w=1200','2026-04-21 21:41:33'),(6,'Watch Bruce the parrot defeat his rivals with only half a beak','<ul><li>ANIMALS</li></ul><p>While the kea parrot’s beak would normally be considered essential for survival, Bruce has innovated other ways of commanding respect.</p><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/e25bfed5-f69a-4bb6-8f95-18e0a2547515/f8ae4021-18af-4843-8951-02981a1f47a4.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><p>Kea parrots are known for being extremely curious and capable of solving complex problems ; they can even make each other chuckle . Now, for the first time, a kea named Bruce has demonstrated skilled combat techniques after losing his upper beak.  </p><p>Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand. These olive-green parrots have fiery orange feathers under their wings and live in the mountains of New Zealand’s South Island.</p><p>To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group. Their findings, published in the journal Current Biology , reveal that Bruce uses a novel jousting-like attack with his feet and lower beak to vanquish rivals.</p><p>“I think it’s very clear that Bruce has made the most of his half-beak,” says Amalia Bastos , a comparative psychologist at the University of St. Andrews in Scotland who was not involved in the study. “He might never have survived in the wild, but in captivity he has managed to innovate new behaviors to displace other birds.”</p><figcaption class=\"article-inline-caption\">( These parrots can make other parrots &amp;#x27;laugh&amp;#x27;—a first )</figcaption><h2>A precocious parrot  </h2><p>An endangered species, the crow-size kea are found only in New Zealand. Their cleverness sometimes manifests itself in “cheeky behaviors” like stealing shiny objects and gnawing on windshield wipers, says biologist Alex Grabham , a postdoctoral research fellow at the University of Canterbury and the lead author of the paper.  </p><p>The kea’s sharp, curved beak ordinarily serves as their essential built-in Swiss army knife. The parrots use their beaks to pry things open, preen their feathers and pick off parasites. “Losing it would likely make survival in the wild very difficult,” says Alice Auersperg , a cognitive biologist at the University of Veterinary Medicine Vienna who studies intelligence in parrots but was not involved in the research.</p><p>  Bruce lost his upper beak when he was a juvenile, possibly after a run-in with a rat trap. The injured parrot was rescued by the New Zealand Department of Conservation and brought to Willowbank’s aviary. Over more than a decade in captivity, Bruce has shown a knack for coming up with new behaviors to compensate for his missing beak. For example, Bastos and her colleagues observed Bruce sticking pebbles between his tongue and lower beak to preen his feathers .</p><figcaption class=\"article-inline-caption\">( Crows and parrots—brainy birds, but in different ways )</figcaption><h2>Champion of the circus</h2><p>Some scientists and keepers wondered if Bruce’s ingenuity may also benefit his social standing. Grabham and his colleagues recently analyzed years-worth of observational data on Bruce’s interactions with the eight other male kea living at Willowbank.</p><p>Over the span of 12 years, Bruce duked it out with the other males on 36 occasions. Despite being the only parrot in the circus lacking an upper beak, Bruce came out victorious every time. The scientists recorded videos of these interactions, allowing them to closely analyze Bruce’s attack.</p><h2>You May Also Like</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/6d7d7cdf-629b-469c-91a5-8bb127af9e05/NPL_01712224_square.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>A clever cockatoo picked up a human skill—and then it spread</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/a71d4a31-e2e7-4cc9-b5bd-42804ce45d6b/MM10198_770A5526_FINAL_square.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>What happens to exotic pets that outlive their owners?</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/0c512803-c985-4d7e-9ea0-b9ebf6630770/naturepl_01625840_square.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>How a penguin ‘divorce’ can impact a whole colony</h2><p>Whereas most kea tried to bite their opponents’ necks with their large beaks, Bruce exhibited a novel long-range attack. He ran and jumped at the other parrot with his clawed feet sticking out. The movement reminded Grabham of a jousting knight riding a horse. The other kea at Willowbank struggled to stop their jousting counterpart. The scientists discovered that Bruce’s jousting move knocked his opponents off balance during nearly 75 percent of his battles.  </p><p>Once Bruce had a parrot on its heels, his dagger-like lower beak finished the job. Like a boxer peppering an opponent with jabs, Bruce used the remaining part of his beak to strike opponents in the back, head, wings and feet.  </p><p>To add context to Bruce’s success on the battlefield, the team also investigated the various parrots’ hormones. The scientists collected poop from each kea and pinpointed traces of glucocorticoid metabolites, a hormone commonly linked to readiness or stress. Of all the kea studied, Bruce had the lowest levels of the hormone.</p><p>The finding surprised Bastos. “You would have expected the dominant individual to experience the most stress trying to maintain their position,” she said.</p><h2>Perks of innovation  </h2><p>Scientists say Bruce’s dominance allowed him to live a stress-free existence as Willowbank’s alpha kea. He was the only parrot in his circus to receive preening from other male parrots, who picked at debris surrounding Bruce’s lower beak and head. Additionally, Bruce was often the first to arrive at the feeding stations, was never challenged while eating and sometimes took sole custody of a feeding station for 15 minutes at a time.  </p><p>Bruce is not the only known case of a seemingly disabled animal achieving social success. Some examples include Faben, a chimpanzee who lost the use of his arm due to polio —which was documented by the late primatologist Jane Goodall —and an elderly Japanese macaque that could no longer walk . However, these primates were aided by alliances with siblings and mates. Bruce, on the other hand, was able to achieve success on his own.</p><p>Auersperg thinks it is possible that other species of parrots could also be capable of overcoming the challenges presented by a missing beak. “Bruce is an extreme case, but the broader pattern may translate,” she says, mentioning anecdotal reports of captive parrots with similar injuries using their lower beak like a shovel to scoop up food.  </p><p>It is unclear if Bruce’s jousting technique would work in the wild, however. In captivity, Bruce interacts with only a small number of parrots. “In the wild, Bruce has a better chance of crossing paths with a bird that could figure him out,” Grabham says.</p><p>Grabham thinks the new findings provide interesting insights into caring for captive animals. For example, Bruce shows that replacing missing body parts with prosthetics may not always benefit an animal. If Bruce was equipped with a prosthetic beak, he may not have developed his unstoppable jousting attack.</p><p>In this way, Grabham thinks Bruce’s success may tell also us something about ourselves. “We thought that missing a beak would cause him to struggle but I think that&amp;#x27;s probably a prejudice of society&amp;#x27;s view on disabilities,” he says. “We associate disability with struggle and stress, but Bruce shows us it can be the opposite.”</p><h2>Related Topics</h2><ul><li>PARROTS</li><li>ANIMALS</li><li>ANIMAL BEHAVIOR</li><li>WEIRD NATURE</li><li>WEIRD ANIMALS</li></ul><h2>You May Also Like</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/0f78dcaf-8f31-4323-8b83-6061b4a47982/1_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>The surprising hidden glow of one of Earth’s largest birds</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/3387bf6b-f939-427c-8331-64763fe3fd51/P9PXPJ_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>How these parrots went from the tropical jungle to the concrete jungle</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/84b42271-0fc8-4d0f-b730-148bce346910/DSC_4795_Kopie_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>This fish has cloned itself for 100,000 years. Scientists just figured out how.</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/d249ca1e-b7d8-42fb-bbec-f2111472ad4f/52526335693_82c7bcc328_o_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>How New Zealand saved a flightless parrot from extinction</h2><figure class=\"article-inline-image\"><img src=\"https://i.natgeofe.com/n/216fd32a-4541-4cf0-8903-744cb92f1ff7/BirdFeeders_OG_4x3.jpg\" alt=\"Article image\" loading=\"lazy\" referrerpolicy=\"no-referrer\" /></figure><h2>Play to find out which birds dominate at your feeder—and why</h2>','https://www.nationalgeographic.com/animals/article/kea-parrot-bruce-jousting-science',2,'2026-04-21 07:44:00','Trung bình',15,'Đã xuất bản','https://i.natgeofe.com/n/6706b6aa-039c-4911-a6eb-df4435d2ea33/AlexGrabham_16x9.jpg?w=1200',NULL);
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcard_decks`
--

DROP TABLE IF EXISTS `flashcard_decks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcard_decks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `folder_id` int(11) DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_deck_user` (`user_id`),
  KEY `fk_deck_folder` (`folder_id`),
  CONSTRAINT `fk_deck_folder` FOREIGN KEY (`folder_id`) REFERENCES `flashcard_folders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_deck_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcard_decks`
--

LOCK TABLES `flashcard_decks` WRITE;
/*!40000 ALTER TABLE `flashcard_decks` DISABLE KEYS */;
INSERT INTO `flashcard_decks` VALUES (3,2,3,'Bai 1','gg','2026-04-20 14:36:53','2026-04-21 22:56:35');
/*!40000 ALTER TABLE `flashcard_decks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcard_folders`
--

DROP TABLE IF EXISTS `flashcard_folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcard_folders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_folder_user` (`user_id`),
  CONSTRAINT `fk_folder_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcard_folders`
--

LOCK TABLES `flashcard_folders` WRITE;
/*!40000 ALTER TABLE `flashcard_folders` DISABLE KEYS */;
INSERT INTO `flashcard_folders` VALUES (3,2,'Hoc tieng Anh','2026-04-20 13:43:04'),(4,2,'hoc','2026-04-20 13:43:25'),(5,1,'On thi topik','2026-04-22 08:35:32');
/*!40000 ALTER TABLE `flashcard_folders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcards`
--

DROP TABLE IF EXISTS `flashcards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deck_id` int(11) NOT NULL,
  `custom_vocab_id` int(11) DEFAULT NULL,
  `front_text` text COLLATE utf8mb4_unicode_ci,
  `back_text` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_card_deck` (`deck_id`),
  KEY `fk_card_custom_vocab` (`custom_vocab_id`),
  CONSTRAINT `fk_card_custom_vocab` FOREIGN KEY (`custom_vocab_id`) REFERENCES `user_vocabulary_custom` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_card_deck` FOREIGN KEY (`deck_id`) REFERENCES `flashcard_decks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcards`
--

LOCK TABLES `flashcards` WRITE;
/*!40000 ALTER TABLE `flashcards` DISABLE KEYS */;
INSERT INTO `flashcards` VALUES (3,3,11,'interdisciplinary','Của hoặc liên quan đến nhiều ngành học hoặc lĩnh vực nghiên cứu riêng biệt.','2026-04-20 14:37:50'),(4,3,12,'operation','một hoạt động dự trù liên quan đến nhiều người được thực hiện với mục đích cụ thể','2026-04-20 15:26:52'),(5,3,13,'countries','quốc gia','2026-04-20 15:35:39'),(6,3,14,'strait','eo biển hẹp','2026-04-20 15:51:06'),(7,3,20,'address','bài diễn văn','2026-04-21 22:56:35');
/*!40000 ALTER TABLE `flashcards` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboard`
--

LOCK TABLES `leaderboard` WRITE;
/*!40000 ALTER TABLE `leaderboard` DISABLE KEYS */;
INSERT INTO `leaderboard` VALUES (1,2,50,1),(2,1,50,2);
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Đang mở',
  `lesson_image` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` datetime DEFAULT NULL,
  `difficulty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Trung bình',
  `is_premium` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `topic_id` (`topic_id`),
  KEY `idx_lessons_deleted_at` (`deleted_at`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,3,'Bài 1','Học','Đang mở','',NULL,'Trung bình',1);
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
  `selected_index` bigint(20) DEFAULT NULL,
  `meaning_vi` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lookup_user` (`user_id`),
  KEY `idx_lookup_word` (`word`),
  KEY `fk_lookup_article` (`article_id`),
  CONSTRAINT `fk_lookup_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lookup_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lookup_history`
--

LOCK TABLES `lookup_history` WRITE;
/*!40000 ALTER TABLE `lookup_history` DISABLE KEYS */;
INSERT INTO `lookup_history` VALUES (1,1,'central',3,'In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i','[{\"index\": 0, \"example\": \"\", \"contextMatch\": true, \"definitionEn\": \"Being in the centre.\", \"definitionVi\": \"Tam dich: Being in the centre.\", \"partOfSpeech\": \"adjective\"}, {\"index\": 1, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Having or containing the centre of something.\", \"definitionVi\": \"Tam dich: Having or containing the centre of something.\", \"partOfSpeech\": \"adjective\"}, {\"index\": 2, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Being very important, or key to something.\", \"definitionVi\": \"Tam dich: Being very important, or key to something.\", \"partOfSpeech\": \"adjective\"}, {\"index\": 3, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Exerting its action towards the peripheral organs.\", \"definitionVi\": \"Tam dich: Exerting its action towards the peripheral organs.\", \"partOfSpeech\": \"adjective\"}]',0,'Tam dich: Being in the centre.','2026-04-01 02:27:47'),(2,1,'neighborhoods',3,'In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i','[{\"index\": 0, \"example\": \"Our neighborhood was our only reason to exchange hollow greetings.\", \"contextMatch\": false, \"definitionEn\": \"The quality of being a neighbor, of living nearby, next to each-other; proximity.\", \"definitionVi\": \"Tam dich: The quality of being a neighbor, of living nearby, next to each-other; proximity.\", \"partOfSpeech\": \"noun\"}, {\"index\": 1, \"example\": \"He lives in my neighborhood.\", \"contextMatch\": false, \"definitionEn\": \"Close proximity, nearby area; particularly, close proximity to one\'s home.\", \"definitionVi\": \"Tam dich: Close proximity, nearby area; particularly, close proximity to one\'s home.\", \"partOfSpeech\": \"noun\"}, {\"index\": 2, \"example\": \"The fire alarmed the neighborhood.\", \"contextMatch\": false, \"definitionEn\": \"The inhabitants of a residential area.\", \"definitionVi\": \"Tam dich: The inhabitants of a residential area.\", \"partOfSpeech\": \"noun\"}, {\"index\": 3, \"example\": \"We have just moved to a pleasant neighborhood.\", \"contextMatch\": true, \"definitionEn\": \"A formal or informal division of a municipality or region.\", \"definitionVi\": \"Tam dich: A formal or informal division of a municipality or region.\", \"partOfSpeech\": \"noun\"}, {\"index\": 4, \"example\": \"He must be making in the neighborhood of $200,000 per year.\", \"contextMatch\": false, \"definitionEn\": \"An approximate amount.\", \"definitionVi\": \"Tam dich: An approximate amount.\", \"partOfSpeech\": \"noun\"}, {\"index\": 5, \"example\": \"The slums and the palace were in awful neighborhood.\", \"contextMatch\": false, \"definitionEn\": \"The quality of physical proximity.\", \"definitionVi\": \"Tam dich: The quality of physical proximity.\", \"partOfSpeech\": \"noun\"}, {\"index\": 6, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The disposition becoming a neighbor; neighborly kindness or good will.\", \"definitionVi\": \"Tam dich: The disposition becoming a neighbor; neighborly kindness or good will.\", \"partOfSpeech\": \"noun\"}, {\"index\": 7, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Within a topological space:\", \"definitionVi\": \"Tam dich: Within a topological space:\", \"partOfSpeech\": \"noun\"}, {\"index\": 8, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Within a metric space:\", \"definitionVi\": \"Tam dich: Within a metric space:\", \"partOfSpeech\": \"noun\"}, {\"index\": 9, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The infinitesimal open set of all points that may be reached directly from a given point.\", \"definitionVi\": \"Tam dich: The infinitesimal open set of all points that may be reached directly from a given point.\", \"partOfSpeech\": \"noun\"}, {\"index\": 10, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The set of all the vertices adjacent to a given vertex.\", \"definitionVi\": \"Tam dich: The set of all the vertices adjacent to a given vertex.\", \"partOfSpeech\": \"noun\"}]',3,'Tam dich: A formal or informal division of a municipality or region.','2026-04-01 02:43:43'),(3,1,'nail',3,'In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i','[{\"index\": 0, \"example\": \"When I\'m nervous I bite my nails.\", \"contextMatch\": false, \"definitionEn\": \"The thin, horny plate at the ends of fingers and toes on humans and some other animals.\", \"definitionVi\": \"Tam dich: The thin, horny plate at the ends of fingers and toes on humans and some other animals.\", \"partOfSpeech\": \"noun\"}, {\"index\": 1, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The basal thickened portion of the anterior wings of certain hemiptera.\", \"definitionVi\": \"Tam dich: The basal thickened portion of the anterior wings of certain hemiptera.\", \"partOfSpeech\": \"noun\"}, {\"index\": 2, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The terminal horny plate on the beak of ducks, and other allied birds.\", \"definitionVi\": \"Tam dich: The terminal horny plate on the beak of ducks, and other allied birds.\", \"partOfSpeech\": \"noun\"}, {\"index\": 3, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"The claw of a bird or other animal.\", \"definitionVi\": \"Tam dich: The claw of a bird or other animal.\", \"partOfSpeech\": \"noun\"}, {\"index\": 4, \"example\": \"\", \"contextMatch\": true, \"definitionEn\": \"A spike-shaped metal fastener used for joining wood or similar materials. The nail is generally driven through two or more layers of material by means of impacts from a hammer or other device. It is then held in place by friction.\", \"definitionVi\": \"Tam dich: A spike-shaped metal fastener used for joining wood or similar materials. The nail is gene...\", \"partOfSpeech\": \"noun\"}, {\"index\": 5, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"A round pedestal on which merchants once carried out their business, such as the four nails outside The Exchange, Bristol.\", \"definitionVi\": \"Tam dich: A round pedestal on which merchants once carried out their business, such as the four nail...\", \"partOfSpeech\": \"noun\"}, {\"index\": 6, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"An archaic English unit of length equivalent to 1/20 of an ell or 1/16 of a yard (2 1/4 inches or 5.715 cm).\", \"definitionVi\": \"Tam dich: An archaic English unit of length equivalent to 1/20 of an ell or 1/16 of a yard (2 1/4 in...\", \"partOfSpeech\": \"noun\"}]',4,'Tam dich: A spike-shaped metal fastener used for joining wood or similar materials. The nail is gene...','2026-04-01 02:44:10'),(4,1,'pets',3,'Along Vespucio Sur Avenue, one of the main strips of Santiago, Chile, a massive real estate billboard advertises a new housing complex: “Green areas, barbecue space, pet-friendly sector.” The growing focus on spaces for pets as a major real estate selling point for couples has spread across the region, and the same sign could be seen in Bogotá, Rio de Janeiro, or any other major Latin American city.','[{\"index\": 0, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"An animal kept as a companion.\", \"definitionVi\": \"Tam dich: An animal kept as a companion.\", \"partOfSpeech\": \"noun\"}, {\"index\": 1, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"(by extension) Something kept as a companion, including inanimate objects. (pet rock, pet plant, etc.)\", \"definitionVi\": \"Tam dich: (by extension) Something kept as a companion, including inanimate objects. (pet rock, pet...\", \"partOfSpeech\": \"noun\"}, {\"index\": 2, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"One who is excessively loyal to a superior.\", \"definitionVi\": \"Tam dich: One who is excessively loyal to a superior.\", \"partOfSpeech\": \"noun\"}, {\"index\": 3, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Any person or animal especially cherished and indulged; a darling.\", \"definitionVi\": \"Tam dich: Any person or animal especially cherished and indulged; a darling.\", \"partOfSpeech\": \"noun\"}, {\"index\": 4, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"To stroke or fondle (an animal).\", \"definitionVi\": \"Tam dich: To stroke or fondle (an animal).\", \"partOfSpeech\": \"verb\"}, {\"index\": 5, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"To stroke or fondle (another person) amorously.\", \"definitionVi\": \"Tam dich: To stroke or fondle (another person) amorously.\", \"partOfSpeech\": \"verb\"}, {\"index\": 6, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"Of two or more people, to stroke and fondle one another amorously.\", \"definitionVi\": \"Tam dich: Of two or more people, to stroke and fondle one another amorously.\", \"partOfSpeech\": \"verb\"}, {\"index\": 7, \"example\": \"His daughter was petted and spoiled.\", \"contextMatch\": false, \"definitionEn\": \"To treat as a pet; to fondle; to indulge.\", \"definitionVi\": \"Tam dich: To treat as a pet; to fondle; to indulge.\", \"partOfSpeech\": \"verb\"}, {\"index\": 8, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"To be a pet.\", \"definitionVi\": \"Tam dich: To be a pet.\", \"partOfSpeech\": \"verb\"}, {\"index\": 9, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"To be peevish; to sulk.\", \"definitionVi\": \"Tam dich: To be peevish; to sulk.\", \"partOfSpeech\": \"verb\"}, {\"index\": 10, \"example\": \"\", \"contextMatch\": true, \"definitionEn\": \"A fit of petulance, a sulk, arising from the impression that one has been offended or slighted.\", \"definitionVi\": \"Tam dich: A fit of petulance, a sulk, arising from the impression that one has been offended or slig...\", \"partOfSpeech\": \"noun\"}, {\"index\": 11, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"A term of endearment usually applied to women and children.\", \"definitionVi\": \"Tam dich: A term of endearment usually applied to women and children.\", \"partOfSpeech\": \"noun\"}]',10,'Tam dich: A fit of petulance, a sulk, arising from the impression that one has been offended or slig...','2026-04-01 02:45:21'),(5,1,'decade',3,'“In Chile, teenage pregnancy rates have dropped by nearly 80% over the past decade, a public health achievement linked to policies promoting reproductive autonomy and greater access to contraception,” she explains.','[{\"index\": 0, \"example\": \"a decade of soldiers\", \"contextMatch\": false, \"definitionEn\": \"A group, set, or series of ten , particularly:\", \"definitionVi\": \"Tam dich: A group, set, or series of ten , particularly:\", \"partOfSpeech\": \"noun\"}, {\"index\": 1, \"example\": \"\", \"contextMatch\": false, \"definitionEn\": \"A set of resistors, capacitors, etc. connected so as to provide even increments between one and ten times a base electrical resistance.\", \"definitionVi\": \"Tam dich: A set of resistors, capacitors, etc. connected so as to provide even increments between on...\", \"partOfSpeech\": \"noun\"}, {\"index\": 2, \"example\": \"There are decades between 1.8 and 18, between 25 and 250 and between 0.03 and 0.003.\", \"contextMatch\": true, \"definitionEn\": \"The interval between any two quantities having a ratio of 10 to 1.\", \"definitionVi\": \"Tam dich: The interval between any two quantities having a ratio of 10 to 1.\", \"partOfSpeech\": \"noun\"}]',2,'Tam dich: The interval between any two quantities having a ratio of 10 to 1.','2026-04-01 02:46:23'),(6,1,'nation',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a large group of people who share the same language, culture, and history and live in a particular area\", \"definitionVi\": \"một nhóm người lớn chia sẻ cùng ngôn ngữ, văn hóa và lịch sử và sống trong một khu vực nhất định\", \"partOfSpeech\": \"noun\"}]',0,'một nhóm người lớn chia sẻ cùng ngôn ngữ, văn hóa và lịch sử và sống trong một khu vực nhất định','2026-04-12 10:59:32'),(7,1,'humanization',3,'The growing humanization of pets in households across Latin America and the Caribbean is perhaps the most tangible symptom of a new generational change. Motherhood is no longer a presumed role, and birth rates are falling at an unprecedented pace.','[{\"index\": 0, \"example\": \"The growing humanization of pets in households across Latin America and the Caribbean is perhaps the most tangible symptom of a new generational change. Motherhood is no longer a presumed role, and birth rates are falling at an unprecedented pace.\", \"contextMatch\": true, \"definitionEn\": \"the process of making something more human or treating it as if it were human\", \"definitionVi\": \"quá trình làm cho một cái gì đó trở nên nhân văn hơn hoặc đối xử với nó như thể nó là con người\", \"partOfSpeech\": \"noun\"}]',0,'quá trình làm cho một cái gì đó trở nên nhân văn hơn hoặc đối xử với nó như thể nó là con người','2026-04-12 12:31:19'),(8,1,'address',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a formal speech or written statement given to an audience\", \"definitionVi\": \"một bài phát biểu hoặc tuyên bố chính thức được đưa ra trước một khán giả\", \"partOfSpeech\": \"noun\"}]',0,'một bài phát biểu hoặc tuyên bố chính thức được đưa ra trước một khán giả','2026-04-13 22:53:38'),(9,1,'deliver',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"to give a formal speech or presentation to an audience\", \"definitionVi\": \"đưa ra một bài phát biểu hoặc trình bày chính thức trước khán giả\", \"partOfSpeech\": \"verb\"}]',0,'đưa ra một bài phát biểu hoặc trình bày chính thức trước khán giả','2026-04-14 15:03:56'),(10,1,'neighborhoods',3,'In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i','[{\"index\": 0, \"example\": \"In one of the most upscale neighborhoods of Mexico City, a nail salon sells gel manicures at a similar price to what its neighboring pet grooming business offers for a “premium petunia bath.” The price points might have turned heads years ago, but now it just makes sense. Dogs have become increasingly central to family life. In the city of Buenos Aires, Argentina, there are already more dogs than children; the same i\", \"contextMatch\": true, \"definitionEn\": \"a district or area within a city or town where people live.\", \"definitionVi\": \"một khu vực hoặc khu phố trong thành phố hoặc thị trấn nơi mọi người sinh sống.\", \"partOfSpeech\": \"noun\"}]',0,'một khu vực hoặc khu phố trong thành phố hoặc thị trấn nơi mọi người sinh sống.','2026-04-14 16:06:53'),(11,1,'address',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a formal speech or statement given to an audience\", \"definitionVi\": \"một bài phát biểu hoặc tuyên bố chính thức được trình bày trước một khán giả\", \"partOfSpeech\": \"noun\"}]',0,'một bài phát biểu hoặc tuyên bố chính thức được trình bày trước một khán giả','2026-04-17 09:05:02'),(12,1,'price',2,'• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.','[{\"index\": 0, \"example\": \"• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.\", \"contextMatch\": true, \"definitionEn\": \"the amount of money expected, required, or given in payment for something\", \"definitionVi\": \"số tiền mà người ta mong đợi, yêu cầu hoặc trả để mua một cái gì đó\", \"partOfSpeech\": \"noun\"}]',0,'số tiền mà người ta mong đợi, yêu cầu hoặc trả để mua một cái gì đó','2026-04-17 09:11:48'),(13,1,'america',3,'The growing humanization of pets in households across Latin America and the Caribbean is perhaps the most tangible symptom of a new generational change. Motherhood is no longer a presumed role, and birth rates are falling at an unprecedented pace.','[{\"index\": 0, \"example\": \"The growing humanization of pets in households across Latin America and the Caribbean is perhaps the most tangible symptom of a new generational change. Motherhood is no longer a presumed role, and birth rates are falling at an unprecedented pace.\", \"contextMatch\": true, \"definitionEn\": \"A continent that includes countries in the Western Hemisphere, particularly referring to the regions of North America, Central America, and South America.\", \"definitionVi\": \"Một lục địa bao gồm các quốc gia ở bán cầu Tây, đặc biệt chỉ các khu vực Bắc Mỹ, Trung Mỹ và Nam Mỹ.\", \"partOfSpeech\": \"noun\"}]',0,'Một lục địa bao gồm các quốc gia ở bán cầu Tây, đặc biệt chỉ các khu vực Bắc Mỹ, Trung Mỹ và Nam Mỹ.','2026-04-17 16:04:19'),(14,1,'sociologist',3,'Every morning, on her way to the Pontifical Catholic University of Chile, sociologist Martina Yopo Díaz looks at the Vespucio Sur housing billboard as symptomatic of how “children, and reproduction in a broader sense, are occupying an increasingly marginal place in the life projects of younger generations.”','[{\"index\": 0, \"example\": \"Every morning, on her way to the Pontifical Catholic University of Chile, sociologist Martina Yopo Díaz looks at the Vespucio Sur housing billboard as symptomatic of how “children, and reproduction in a broader sense, are occupying an increasingly marginal place in the life projects of younger generations.”\", \"contextMatch\": true, \"definitionEn\": \"a person who studies the development, structure, and functioning of human society\", \"definitionVi\": \"một người nghiên cứu sự phát triển, cấu trúc và chức năng của xã hội loài người\", \"partOfSpeech\": \"noun\"}]',0,'một người nghiên cứu sự phát triển, cấu trúc và chức năng của xã hội loài người','2026-04-17 16:11:37'),(15,1,'pro-natalist',3,'Experts tend to be cautious. Globally, countries that have implemented pro-natalist policies – bonuses, generous parental leave – have achieved, at best, modest or temporary increases.','[{\"index\": 0, \"example\": \"Experts tend to be cautious. Globally, countries that have implemented pro-natalist policies – bonuses, generous parental leave – have achieved, at best, modest or temporary increases.\", \"contextMatch\": true, \"definitionEn\": \"relating to or advocating policies that encourage higher birth rates.\", \"definitionVi\": \"liên quan đến hoặc ủng hộ các chính sách khuyến khích tỷ lệ sinh cao hơn.\", \"partOfSpeech\": \"adjective\"}]',0,'liên quan đến hoặc ủng hộ các chính sách khuyến khích tỷ lệ sinh cao hơn.','2026-04-17 16:21:30'),(16,1,'deliver',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"to give a formal speech or presentation\", \"definitionVi\": \"đưa ra một bài phát biểu hoặc trình bày chính thức\", \"partOfSpeech\": \"verb\"}]',0,'đưa ra một bài phát biểu hoặc trình bày chính thức','2026-04-18 08:58:48'),(17,1,'address',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a formal speech or statement given to an audience\", \"definitionVi\": \"một bài phát biểu hoặc tuyên bố chính thức được trình bày trước một khán giả\", \"partOfSpeech\": \"noun\"}]',0,'một bài phát biểu hoặc tuyên bố chính thức được trình bày trước một khán giả','2026-04-18 15:05:45'),(18,1,'operation',2,'• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.','[{\"index\": 0, \"example\": \"• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.\", \"contextMatch\": true, \"definitionEn\": \"a planned activity involving many people that is done for a particular purpose, often connected with business or military activities\", \"definitionVi\": \"một hoạt động được lên kế hoạch liên quan đến nhiều người được thực hiện với mục đích cụ thể, thường liên quan đến hoạt động kinh doanh hoặc quân sự\", \"partOfSpeech\": \"word\"}]',0,'một hoạt động được lên kế hoạch liên quan đến nhiều người được thực hiện với mục đích cụ thể, thường liên quan đến hoạt động kinh doanh hoặc quân sự','2026-04-19 05:05:26'),(19,1,'address',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a formal speech given in public\", \"definitionVi\": \"bài phát biểu công khai\", \"partOfSpeech\": \"word\"}]',0,'bài phát biểu công khai','2026-04-19 05:13:49'),(20,2,'address',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a formal speech given to an audience\", \"definitionVi\": \"bài phát biểu\", \"partOfSpeech\": \"word\"}]',0,'bài phát biểu','2026-04-19 08:46:34'),(21,2,'nation',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a large aggregate of people united by common descent, history, culture, or language, inhabiting a particular country or territory.\", \"definitionVi\": \"quốc gia\", \"partOfSpeech\": \"word\"}]',0,'quốc gia','2026-04-19 08:51:27'),(22,2,'countries',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"political states, nations\", \"definitionVi\": \"quốc gia\", \"partOfSpeech\": \"word\"}]',0,'quốc gia','2026-04-19 08:52:36'),(23,2,'deliver',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"to provide a speech, or to make a formal or public statement, or to perform a play or piece of music for an audience\", \"definitionVi\": \"phát biểu, thông báo, hoặc biểu diễn trước công chúng\", \"partOfSpeech\": \"word\"}]',0,'phát biểu, thông báo, hoặc biểu diễn trước công chúng','2026-04-20 13:59:01'),(24,2,'address',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a formal speech given to an audience\", \"definitionVi\": \"bài phát biểu\", \"partOfSpeech\": \"word\"}]',0,'bài phát biểu','2026-04-20 14:03:15'),(25,2,'white',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"the type of house that is an official residence where the president of the US lives and works\", \"definitionVi\": \"Nhà Trắng (tòa nhà của thống đốc Mỹ)\", \"partOfSpeech\": \"word\"}]',0,'Nhà Trắng (tòa nhà của thống đốc Mỹ)','2026-04-20 14:38:43'),(26,2,'immediate',2,'• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.','[{\"index\": 0, \"example\": \"• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.\", \"contextMatch\": true, \"definitionEn\": \"occurring or done at once; instant\", \"definitionVi\": \"ngay lập tức\", \"partOfSpeech\": \"word\"}]',0,'ngay lập tức','2026-04-20 14:43:09'),(27,2,'operation',2,'• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.','[{\"index\": 0, \"example\": \"• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.\", \"contextMatch\": true, \"definitionEn\": \"an organized and planned activity involving a number of people\", \"definitionVi\": \"hoạt động tổ chức và lên kế hoạch liên quan đến nhiều người\", \"partOfSpeech\": \"word\"}]',0,'hoạt động tổ chức và lên kế hoạch liên quan đến nhiều người','2026-04-20 14:57:46'),(28,2,'according',2,'• US tech companies threatened: Apple, Microsoft, Google, Meta, IBM, HP, Intel and Tesla are among the 17 American companies Tehran has threatened to attack if more Iranian leaders are killed, according to the semi-official outlet Fars.','[{\"index\": 0, \"example\": \"• US tech companies threatened: Apple, Microsoft, Google, Meta, IBM, HP, Intel and Tesla are among the 17 American companies Tehran has threatened to attack if more Iranian leaders are killed, according to the semi-official outlet Fars.\", \"contextMatch\": true, \"definitionEn\": \"as stated by or in\", \"definitionVi\": \"theo như đã nêu hoặc trong\", \"partOfSpeech\": \"word\"}]',0,'theo như đã nêu hoặc trong','2026-04-20 15:03:12'),(29,2,'gallon',2,'• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.','[{\"index\": 0, \"example\": \"• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.\", \"contextMatch\": true, \"definitionEn\": \"a unit of volume for liquid measure equal to four quarts, in particular a US unit equal to 3.785 liters.\", \"definitionVi\": \"đơn vị tính thể tích cho đo lường dung tích chất lỏng tương đương với bốn quả lít, đặc biệt là đơn vị Mỹ bằng 3.785 lít.\", \"partOfSpeech\": \"word\"}]',0,'đơn vị tính thể tích cho đo lường dung tích chất lỏng tương đương với bốn quả lít, đặc biệt là đơn vị Mỹ bằng 3.785 lít.','2026-04-20 15:05:09'),(30,2,'operation',2,'• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.','[{\"index\": 0, \"example\": \"• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.\", \"contextMatch\": true, \"definitionEn\": \"a planned activity involving many people that is done for a particular purpose\", \"definitionVi\": \"một hoạt động dự trù liên quan đến nhiều người được thực hiện với mục đích cụ thể\", \"partOfSpeech\": \"word\"}]',0,'một hoạt động dự trù liên quan đến nhiều người được thực hiện với mục đích cụ thể','2026-04-20 15:15:03'),(31,2,'countries',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"political states that are sovereign in nature and commonly defined by borders, government, and population\", \"definitionVi\": \"quốc gia\", \"partOfSpeech\": \"word\"}]',0,'quốc gia','2026-04-20 15:35:32'),(32,2,'strait',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”\", \"contextMatch\": true, \"definitionEn\": \"a narrow passage of water connecting two seas or two large areas of water\", \"definitionVi\": \"eo biển hẹp\", \"partOfSpeech\": \"word\"}]',0,'eo biển hẹp','2026-04-20 15:50:52'),(33,2,'survival',6,'Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand. These olive-green parrots have fiery orange feathers under their wings and live in the mountains of New Zealand’s South Island.','[{\"index\": 0, \"example\": \"Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand. These olive-green parrots have fiery orange feathers under their wings and live in the mountains of New Zealand’s South Island.\", \"contextMatch\": true, \"definitionEn\": \"the state or fact of continuing to live or exist, typically in spite of an accident, ordeal, or difficult circumstances\", \"definitionVi\": \"sự sống sót\", \"partOfSpeech\": \"word\"}]',0,'sự sống sót','2026-04-21 14:46:57'),(34,2,'becoming',6,'Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.','[{\"index\": 0, \"example\": \"Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.\", \"contextMatch\": true, \"definitionEn\": \"attractive or suitable on someone\", \"definitionVi\": \"phù hợp hoặc lôi cuốn trên ai đó\", \"partOfSpeech\": \"word\"}]',0,'phù hợp hoặc lôi cuốn trên ai đó','2026-04-21 14:51:21'),(35,2,'crucial',6,'Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.','[{\"index\": 0, \"example\": \"Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.\", \"contextMatch\": true, \"definitionEn\": \"extremely important or necessary\", \"definitionVi\": \"rất quan trọng hoặc cần thiết\", \"partOfSpeech\": \"word\"}]',0,'rất quan trọng hoặc cần thiết','2026-04-21 14:51:30'),(36,2,'crucial',6,'Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.','[{\"index\": 0, \"example\": \"Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.\", \"contextMatch\": true, \"definitionEn\": \"extremely important or necessary; critical\", \"definitionVi\": \"rất quan trọng hoặc cần thiết; quyết định\", \"partOfSpeech\": \"adjective\"}]',0,'rất quan trọng hoặc cần thiết; quyết định','2026-04-21 15:03:59'),(37,2,'impediment',6,'To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"a barrier; obstruction\", \"definitionVi\": \"chướng ngại vật\", \"partOfSpeech\": \"noun\"}]',0,'chướng ngại vật','2026-04-21 15:08:30'),(38,2,'interacted',6,'To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchers recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchers recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"to communicate or work together\", \"definitionVi\": \"tương tác hoặc làm việc cùng nhau\", \"partOfSpeech\": \"verb\"}]',0,'tương tác hoặc làm việc cùng nhau','2026-04-21 15:36:46'),(39,2,'research',6,'To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchers recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchers recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"to investigate systematically\", \"definitionVi\": \"nghiên cứu\", \"partOfSpeech\": \"verb\"}]',0,'nghiên cứu','2026-04-21 22:45:40'),(40,2,'social',6,'To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchersresearchers [null]nghiên cứu recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchersresearchers [null]nghiên cứu recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-21 22:50:11'),(41,2,'captivity',6,'“He might never have survived in the wild, but in captivity he has managed to innovate new behaviors to displace other birds.','[{\"index\": 0, \"example\": \"“He might never have survived in the wild, but in captivity he has managed to innovate new behaviors to displace other birds.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-21 22:50:22'),(42,2,'reserve',6,'Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.','[{\"index\": 0, \"example\": \"Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.\", \"contextMatch\": true, \"definitionEn\": \"a place set apart for special use, such as a nature reserve\", \"definitionVi\": \"nơi được dành riêng cho mục đích đặc biệt, như khu bảo tồn thiên nhiên\", \"partOfSpeech\": \"noun\"}]',0,'nơi được dành riêng cho mục đích đặc biệt, như khu bảo tồn thiên nhiên','2026-04-21 22:51:17'),(43,2,'standing',6,'To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchersresearchers [null]nghiên cứu recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchersresearchers [null]nghiên cứu recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-21 22:55:19'),(44,2,'analyze',6,'To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchersresearchers [null]nghiên cứu recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchersresearchers [null]nghiên cứu recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"to examine something in detail, in order to discover more about it\", \"definitionVi\": \"phân tích\", \"partOfSpeech\": \"verb\"}]',0,'phân tích','2026-04-21 22:55:35'),(45,2,'address',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced.','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced.\", \"contextMatch\": true, \"definitionEn\": \"a formal speech given to an audience\", \"definitionVi\": \"bài diễn văn\", \"partOfSpeech\": \"noun\"}]',0,'bài diễn văn','2026-04-21 22:56:24'),(46,1,'country',2,'Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.','[{\"index\": 0, \"example\": \"Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.\", \"contextMatch\": true, \"definitionEn\": \"a nation or territory considered as an organized political community under one government\", \"definitionVi\": \"đất nước\", \"partOfSpeech\": \"noun\"}]',0,'đất nước','2026-04-22 08:11:34'),(47,1,'determine',6,'To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-22 08:33:27'),(48,1,'determine',6,'To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-22 08:33:33'),(49,1,'standing',6,'To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-22 08:33:44'),(50,1,'primatologist',6,'Some examples include Faben, a chimpanzee who lost the use of his arm due to polio —which was documented by the late primatologist Jane Goodall —and an elderly Japanese macaque that could no longer walk .','[{\"index\": 0, \"example\": \"Some examples include Faben, a chimpanzee who lost the use of his arm due to polio —which was documented by the late primatologist Jane Goodall —and an elderly Japanese macaque that could no longer walk .\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-22 08:33:57'),(51,1,'reserve',6,'Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.','[{\"index\": 0, \"example\": \"Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-22 08:35:53'),(52,1,'reserve',6,'Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.','[{\"index\": 0, \"example\": \"Despite missing a facial feature thought to be crucial for survival, Bruce has worked his way to becoming the alpha male of his circus, the collective noun for a group of kea, at the Willowbank Wildlife Reserve in Christchurch, New Zealand.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-22 08:36:49'),(53,1,'precocious',6,'A precocious parrot','[{\"index\": 0, \"example\": \"A precocious parrot\", \"contextMatch\": true, \"definitionEn\": \"having developed certain abilities or inclinations at an earlier age than usual\", \"definitionVi\": \"sớm phát triển, sớm thông minh\", \"partOfSpeech\": \"adjective\"}]',0,'sớm phát triển, sớm thông minh','2026-04-22 08:38:02'),(54,1,'social',6,'To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-22 08:39:17'),(55,1,'immediate',2,'CNN has reported how an end to the war will not mean immediate savings at the pump.','[{\"index\": 0, \"example\": \"CNN has reported how an end to the war will not mean immediate savings at the pump.\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-22 08:40:16'),(56,1,'nation',2,'• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced.','[{\"index\": 0, \"example\": \"• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced.\", \"contextMatch\": true, \"definitionEn\": \"a group of people who share the same culture, history, language, etc.\", \"definitionVi\": \"một nhóm người chia sẻ cùng văn hoá, lịch sử, ngôn ngữ, v.v.\", \"partOfSpeech\": \"noun\"}]',0,'một nhóm người chia sẻ cùng văn hoá, lịch sử, ngôn ngữ, v.v.','2026-04-22 08:49:13'),(57,1,'learn',NULL,'easy English to help you learn. I\'m Beth.','[{\"index\": 0, \"example\": \"easy English to help you learn. I\'m Beth.\", \"contextMatch\": true, \"definitionEn\": \"to acquire knowledge of or skill in by study, instruction, or experience\", \"definitionVi\": \"học\", \"partOfSpeech\": \"verb\"}]',0,'học','2026-04-22 08:50:35'),(58,1,'learn',NULL,'easy English to help you learn. I\'m Beth.','[{\"index\": 0, \"example\": \"easy English to help you learn. I\'m Beth.\", \"contextMatch\": true, \"definitionEn\": \"to gain knowledge or skill by studying, practicing, or being taught\", \"definitionVi\": \"học\", \"partOfSpeech\": \"verb\"}]',0,'học','2026-04-22 08:50:42'),(59,2,'research',6,'To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchersresearchers [null]nghiên cứu recently analyzed how Bruce interacted with other males in his group.','[{\"index\": 0, \"example\": \"To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchersresearchers [null]nghiên cứu recently analyzed how Bruce interacted with other males in his group.\", \"contextMatch\": true, \"definitionEn\": \"to investigate systematically\", \"definitionVi\": \"nghiên cứu một cách có hệ thống\", \"partOfSpeech\": \"verb\"}]',0,'nghiên cứu một cách có hệ thống','2026-04-22 16:50:37'),(60,2,'survive',6,'“He might never have survived in the wild, but in captivity he has managed to innovate new behaviors to displace other birds.','[{\"index\": 0, \"example\": \"“He might never have survived in the wild, but in captivity he has managed to innovate new behaviors to displace other birds.\", \"contextMatch\": true, \"definitionEn\": \"to continue to live or exist, especially after coming close to dying or being destroyed\", \"definitionVi\": \"sống sót\", \"partOfSpeech\": \"verb\"}]',0,'sống sót','2026-04-22 16:50:49'),(61,2,'precocious',6,'A precocious parrot','[{\"index\": 0, \"example\": \"A precocious parrot\", \"contextMatch\": true, \"definitionEn\": \"exhibiting mature qualities at an unusually early age\", \"definitionVi\": \"trước tuổi, thông minh hơn bình thường ở độ tuổi trẻ\", \"partOfSpeech\": \"adjective\"}]',0,'trước tuổi, thông minh hơn bình thường ở độ tuổi trẻ','2026-04-22 16:50:56'),(62,1,'essential',6,'While the kea parrot’s beak would normally be considered essential for survival, Bruce has innovated other ways of commanding respect.','[{\"index\": 0, \"example\": \"While the kea parrot’s beak would normally be considered essential for survival, Bruce has innovated other ways of commanding respect.\", \"contextMatch\": true, \"definitionEn\": \"absolutely necessary; extremely important\", \"definitionVi\": \"cần thiết\", \"partOfSpeech\": \"adjective\"}]',0,'cần thiết','2026-04-26 11:49:06'),(63,1,'conversations',NULL,'Hello and welcome to Real Easy English, the podcast where we have real conversations in','[{\"index\": 0, \"example\": \"Hello and welcome to Real Easy English, the podcast where we have real conversations in\", \"contextMatch\": true, \"definitionEn\": \"\", \"definitionVi\": \"\", \"partOfSpeech\": \"\"}]',0,'','2026-04-26 11:49:22');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premium_audit_logs`
--

LOCK TABLES `premium_audit_logs` WRITE;
/*!40000 ALTER TABLE `premium_audit_logs` DISABLE KEYS */;
INSERT INTO `premium_audit_logs` VALUES (6,2,73,3,'APPROVE_REQUEST','AWAITING','APPROVED','Chap nhan','admin','2026-04-20 02:48:15'),(7,2,NULL,3,'CANCEL_PREMIUM','ACTIVE','CANCELED','thua','admin','2026-04-21 15:39:35'),(8,2,75,NULL,'REJECT_REQUEST','PENDING','REJECTED','ee','admin','2026-04-21 22:21:13'),(9,2,74,NULL,'REJECT_REQUEST','PENDING','REJECTED','ee','admin','2026-04-21 22:21:15'),(10,2,76,4,'APPROVE_REQUEST','AWAITING','APPROVED','OK','admin','2026-04-21 23:00:20');
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
) ENGINE=InnoDB AUTO_INCREMENT=373 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premium_feature_limits`
--

LOCK TABLES `premium_feature_limits` WRITE;
/*!40000 ALTER TABLE `premium_feature_limits` DISABLE KEYS */;
INSERT INTO `premium_feature_limits` VALUES (351,3,'SAVED_VOCABULARY',0,999999),(352,3,'DICTIONARY_LOOKUP',0,999999),(353,3,'ARTICLE_DOWNLOADS',0,1),(354,3,'VIDEO_TRANSCRIPT_DOWNLOADS',0,0),(355,3,'SAVED_ARTICLES',0,10),(356,3,'CUSTOM_VOCABULARY_SETS',0,2),(357,3,'MONTHLY_VOCABULARY_TESTS',1,5),(358,3,'VOCABULARY_REVIEW',0,0),(359,3,'FLASHCARD_DECKS',0,999999),(360,3,'FLASHCARDS_PER_DECK',0,999999),(361,3,'SRS_GOLDEN_TIME',0,0),(362,4,'SAVED_VOCABULARY',1,-1),(363,4,'DICTIONARY_LOOKUP',0,999999),(364,4,'ARTICLE_DOWNLOADS',1,0),(365,4,'VIDEO_TRANSCRIPT_DOWNLOADS',1,0),(366,4,'SAVED_ARTICLES',0,10),(367,4,'CUSTOM_VOCABULARY_SETS',0,2),(368,4,'MONTHLY_VOCABULARY_TESTS',0,5),(369,4,'VOCABULARY_REVIEW',1,0),(370,4,'FLASHCARD_DECKS',0,999999),(371,4,'FLASHCARDS_PER_DECK',0,999999),(372,4,'SRS_GOLDEN_TIME',1,0);
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double DEFAULT NULL,
  `duration` int(11) DEFAULT NULL COMMENT 'Thời hạn (ngày)',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả gói',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `premium_plans`
--

LOCK TABLES `premium_plans` WRITE;
/*!40000 ALTER TABLE `premium_plans` DISABLE KEYS */;
INSERT INTO `premium_plans` VALUES (3,'zxxxxxxx',22222,23,'eee'),(4,'Free',0,36500,'Gói mặc định cho người dùng mới');
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_history`
--

LOCK TABLES `review_history` WRITE;
/*!40000 ALTER TABLE `review_history` DISABLE KEYS */;
INSERT INTO `review_history` VALUES (1,1,NULL,4,0,12640,'2026-04-17 16:17:51',NULL),(2,1,NULL,5,0,7448,'2026-04-17 16:21:58',NULL),(3,1,NULL,3,1,3786,'2026-04-18 05:08:15',NULL),(4,1,NULL,4,1,1691,'2026-04-18 05:08:15',NULL),(5,1,NULL,5,1,6694,'2026-04-18 05:08:15',NULL),(6,1,NULL,4,1,2996,'2026-04-18 07:54:16',NULL),(7,1,NULL,5,1,1918,'2026-04-18 07:54:16',NULL),(8,1,2,NULL,0,4612,'2026-04-19 04:24:31',NULL),(9,1,1,NULL,1,2781,'2026-04-19 04:24:31',NULL),(10,2,NULL,6,1,1503,'2026-04-19 05:17:43',NULL),(11,2,NULL,6,1,1654,'2026-04-19 08:37:08',NULL),(12,2,NULL,7,1,1769,'2026-04-20 02:48:55',NULL),(13,2,NULL,8,1,2294,'2026-04-20 15:36:02',NULL),(14,2,NULL,12,1,2151,'2026-04-20 15:36:02',NULL),(15,2,NULL,13,1,3533,'2026-04-20 15:36:02',NULL),(16,2,NULL,14,1,1857,'2026-04-20 15:51:17',NULL),(17,2,NULL,15,1,1629,'2026-04-20 16:29:20',NULL),(18,2,NULL,8,1,5367,'2026-04-21 13:02:36',NULL),(19,2,NULL,12,1,2176,'2026-04-21 13:02:36',NULL),(20,2,NULL,13,1,8069,'2026-04-21 13:02:36',NULL),(21,2,NULL,14,1,2636,'2026-04-21 13:02:36',NULL),(22,2,NULL,15,1,2592,'2026-04-21 13:02:36',NULL),(23,2,NULL,7,0,6442,'2026-04-21 13:02:36',NULL),(24,2,NULL,6,1,2466,'2026-04-21 13:02:36',NULL),(25,2,NULL,16,1,2015,'2026-04-21 15:08:50',NULL),(26,2,NULL,7,1,1973,'2026-04-21 23:01:09',NULL),(27,2,NULL,16,1,3501,'2026-04-21 23:01:09',NULL),(28,2,NULL,17,0,4245,'2026-04-21 23:01:09',NULL),(29,2,NULL,18,1,2047,'2026-04-21 23:01:09',NULL),(30,2,NULL,19,1,1857,'2026-04-21 23:01:09',NULL),(31,1,NULL,2,1,4028,'2026-04-22 08:12:41',NULL),(32,1,2,NULL,1,2286,'2026-04-22 08:12:41',NULL),(33,1,NULL,3,0,4852,'2026-04-22 08:12:41',NULL),(34,1,NULL,4,1,3179,'2026-04-22 08:12:41',NULL),(35,1,NULL,5,1,1869,'2026-04-22 08:12:41',NULL),(36,1,NULL,21,1,3024,'2026-04-22 08:51:02',NULL),(37,2,NULL,17,1,1872,'2026-04-22 15:51:13',NULL),(38,2,NULL,18,1,4036,'2026-04-22 15:51:13',NULL),(39,2,NULL,15,1,5011,'2026-04-22 15:51:13',NULL),(40,2,NULL,13,1,2235,'2026-04-23 06:51:53',NULL),(41,2,NULL,19,1,2994,'2026-04-23 06:51:53',NULL),(42,2,NULL,17,1,3835,'2026-04-23 06:51:53',NULL),(43,2,NULL,7,1,1470,'2026-04-23 06:51:53',NULL),(44,2,NULL,8,1,3405,'2026-04-23 06:51:53',NULL),(45,1,2,NULL,0,3418,'2026-04-23 06:53:18',NULL),(46,1,NULL,3,1,1615,'2026-04-23 06:53:18',NULL),(47,1,NULL,21,1,6467,'2026-04-23 06:53:18',NULL),(48,1,1,NULL,1,1461,'2026-04-23 06:53:18',NULL),(49,1,2,NULL,1,1805,'2026-04-23 13:46:16',NULL),(50,1,NULL,3,1,1629,'2026-04-23 13:46:16',NULL),(51,1,2,NULL,1,528774,'2026-04-25 07:49:57',NULL),(52,1,NULL,21,1,1521,'2026-04-25 07:49:58',NULL),(53,1,NULL,3,1,2009,'2026-04-26 11:50:16',NULL),(54,1,NULL,2,0,1480,'2026-04-26 11:50:16',NULL),(55,1,NULL,4,0,4343,'2026-04-26 11:50:16',NULL),(56,1,NULL,5,1,4549,'2026-04-26 11:50:16',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_sessions`
--

LOCK TABLES `review_sessions` WRITE;
/*!40000 ALTER TABLE `review_sessions` DISABLE KEYS */;
INSERT INTO `review_sessions` VALUES (1,1,1,0,0,'2026-04-17 16:17:51'),(2,1,1,0,0,'2026-04-17 16:21:58'),(3,1,3,3,100,'2026-04-18 05:08:15'),(4,1,2,2,100,'2026-04-18 07:54:16'),(5,1,2,1,50,'2026-04-19 04:24:32'),(6,2,1,1,100,'2026-04-19 05:17:43'),(7,2,1,1,100,'2026-04-19 08:37:08'),(8,2,1,1,100,'2026-04-20 02:48:55'),(9,2,3,3,100,'2026-04-20 15:36:02'),(10,2,1,1,100,'2026-04-20 15:51:17'),(11,2,1,1,100,'2026-04-20 16:29:20'),(12,2,7,6,85.7143,'2026-04-21 13:02:36'),(13,2,1,1,100,'2026-04-21 15:08:50'),(14,2,5,4,80,'2026-04-21 23:01:09'),(15,1,5,4,80,'2026-04-22 08:12:41'),(16,1,1,1,100,'2026-04-22 08:51:02'),(17,2,3,3,100,'2026-04-22 15:51:13'),(18,2,5,5,100,'2026-04-23 06:51:53'),(19,1,4,3,75,'2026-04-23 06:53:18'),(20,1,2,2,100,'2026-04-23 13:46:16'),(21,1,2,2,100,'2026-04-25 07:49:58'),(22,1,4,2,50,'2026-04-26 11:50:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=226 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `segments`
--

LOCK TABLES `segments` WRITE;
/*!40000 ALTER TABLE `segments` DISABLE KEYS */;
INSERT INTO `segments` VALUES (67,1,0,14.239999771118164,'Hi, I\'m Neil. Thanks for joining me on English at Work, a new series of programs set in an',34),(68,2,14.239999771118164,19.399999618530273,'office full of top tips to help you learn some useful business language which you could',34),(69,3,19.399999618530273,25.84000015258789,'use in the workplace. In the next few minutes, you can join me on an introductory tour around',34),(70,4,25.84000015258789,33.47999954223633,'one of London\'s biggest imitation plastic fruit manufacturers called Tip Top Trading.',34),(71,5,33.47999954223633,38.20000076293945,'We\'re going to hear from some of the employees that work so hard to keep the business running',34),(72,6,38.20000076293945,44.52000045776367,'smoothly. So come on then, let\'s step into the office and eavesdrop on Tip Top Trading\'s',34),(73,7,44.52000045776367,50.560001373291016,'possible newest recruit. I say possible because she\'s still being interviewed for the job',34),(74,8,50.560001373291016,60.880001068115234,'of sales executive. Firstly, this job is an ideal match for my skills and experience.',34),(75,9,60.880001068115234,67.4000015258789,'I\'ve spent several years working in sales and I get on with people easily. Well, I mean,',34),(76,10,67.4000015258789,73.5999984741211,'apart from the ones I don\'t like, of course. Secondly, I know Tip Top Trading is one of',34),(77,11,73.5999984741211,78.76000213623047,'the fastest growing companies in London and I want to be part of that. That\'s absolutely',34),(78,12,78.76000213623047,85.19999694824219,'right. Tip Top Trading is the fastest growing company in the plastic fruit sector. Well',34),(79,13,85.19999694824219,91.80000305175781,'said, Anna. If she gets that job, I\'m sure she\'ll be an asset to the company. The decision',34),(80,14,91.80000305175781,99,'is in the hands of manager Paul, who we heard there. He\'s a nice guy, really. Little disorganised,',34),(81,15,99,105.16000366210938,'but when things go wrong, he\'s got to take charge. A bit like this. Yesterday was not',34),(82,16,105.16000366210938,111.36000061035156,'a great day. Two clients came in with serious complaints. Mrs Kumquat received a delivery',34),(83,17,111.36000061035156,119.55999755859375,'of imitation bananas that were purple. Not very convincing. And Mr Lime ordered grapefruits',34),(84,18,119.55999755859375,127.5999984741211,'but got pineapples. Tom! Yeah, listen. Were you responsible for these errors? Well, yes,',34),(85,19,127.5999984741211,133.24000549316406,'but Paul... Mistakes happen. But it seems that Mrs Kumquat left our offices even angrier',34),(86,20,133.24000549316406,139.9199981689453,'than when she came in and she says she will never use Tip Top Trading again. I tried my',34),(87,21,139.9199981689453,147.32000732421875,'best. Hmm. Ah, yes. Tom. I hadn\'t warned you about Tom. One of the company\'s top sales',34),(88,22,147.32000732421875,153.8800048828125,'executives. He\'s good. Yeah, Tom speaking. Yeah, Frankie. So what\'s the latest? Are we',34),(89,23,153.8800048828125,161.47999572753906,'on? But his interpersonal skills need working on. Listen to this. My computer has crashed.',34),(90,24,161.52000427246094,168.9199981689453,'I\'ve lost my phone. And there\'s a big, big problem with my timetable. I\'ve got two meetings',34),(91,25,168.9199981689453,175.24000549316406,'scheduled at the same time with two extremely important clients. I can\'t do them both at',34),(92,26,175.24000549316406,182.9600067138672,'once. See what I mean? Now, every office needs a good office assistant. And Tip Top Trading',34),(93,27,182.9600067138672,190.0399932861328,'is no exception. It\'s got Denise, who\'s there to assist, organise and sometimes make the',34),(94,28,190.0399932861328,199.27999877929688,'tea. Oh, sorry. Excuse me. Here\'s your tea, Paul. Oh, thanks, Denise. Goodness, she likes',34),(95,29,199.27999877929688,205.60000610351562,'to talk. Really? Denise, do this. Denise, do that. I\'m telling you, Sharon, I\'ve almost',34),(96,30,205.60000610351562,213.83999633789062,'had enough. I get treated like some kind of servant. That\'s Denise. I think we\'ll just',34),(97,31,213.83999633789062,219.8000030517578,'leave the office now and let them get on with their work. So that\'s Tip Top Trading. They\'re',34),(98,32,219.8000030517578,224.72000122070312,'a plenty of other people we\'ll meet along the way. So go on. Why don\'t you join me for',34),(99,33,224.72000122070312,229.32000732421875,'English at Work from bbclearningenglish.com. See ya!',34),(163,1,0,6.960000038146973,'Hello and welcome to Real Easy English, the podcast where we have real conversations in',40),(164,2,6.960000038146973,9.920000076293945,'easy English to help you learn. I\'m Beth.',40),(165,3,9.920000076293945,15.199999809265137,'And I\'m Neil. You can watch this podcast and test yourself with a worksheet which',40),(166,4,15.199999809265137,19.360000610351562,'you can get free on our website at bbclearningenglish.com.',40),(167,5,24.639999389648438,27.280000686645508,'So, Neil, how are you today?',40),(168,6,27.84000015258789,32.959999084472656,'I\'m very well, actually. How are you feeling about our recording today? Feeling confident?',40),(169,7,32.959999084472656,36.08000183105469,'I\'m feeling confident. Are you feeling nervous?',40),(170,8,36.08000183105469,38.400001525878906,'Not at all. No, I\'m feeling confident.',40),(171,9,38.400001525878906,45.52000045776367,'Well, today we\'re talking all about confidence. So, listeners might be familiar with the adjective',40),(172,10,45.52000045776367,50.2400016784668,'confidence, which means being certain about something, feeling good about yourself.',40),(173,11,51.20000076293945,57.20000076293945,'But confidence is the noun and it\'s that feeling of being certain,',40),(174,12,57.20000076293945,60.79999923706055,'maybe about your own abilities or about a situation.',40),(175,13,61.36000061035156,66.72000122070312,'OK, that\'s a good description, Beth. Would you say you are a confident person?',40),(176,14,67.91999816894531,70.72000122070312,'I think it really depends on the situation.',40),(177,15,71.68000030517578,80.80000305175781,'So, if I am speaking with you like this, I\'m very confident. I know you. But if I\'m around',40),(178,16,80.80000305175781,86.08000183105469,'people that I don\'t know as much, then I usually feel a bit more shy.',40),(179,17,87.04000091552734,87.5999984741211,'Yeah.',40),(180,18,87.5999984741211,89.76000213623047,'What about you? Are you generally confident?',40),(181,19,90.72000122070312,97.76000213623047,'I think, like you, if I think I know what I\'m doing, then I\'m confident. But if I\'m',40),(182,20,98.63999938964844,105.44000244140625,'doing something, especially with people who maybe know more about that thing than I do,',40),(183,21,106.08000183105469,113.19999694824219,'then that can be nerve wracking, make you feel nervous and then not be confident.',40),(184,22,113.91999816894531,122.87999725341797,'Yeah, definitely. I remember like being in a class in a classroom and if I feel like this',40),(185,23,122.87999725341797,129.67999267578125,'topic is just, I don\'t know, then I would not feel confident at all. Definitely feel nervous.',40),(186,24,129.67999267578125,133.67999267578125,'What other types of situations would make you feel shy or nervous?',40),(187,25,134.63999938964844,142,'I think apart from meeting new people, I always feel a bit nervous with that. I\'m generally',40),(188,26,142,149.1199951171875,'quite confident. So, if it comes to something like public speaking, where I have to talk in',40),(189,27,149.1199951171875,156.8800048828125,'front of a lot of people, if they\'re people I don\'t know, I don\'t really have a problem. I\'m',40),(190,28,156.8800048828125,164.32000732421875,'quite confident. But if I had to speak to a room of people and I know the people, that would make',40),(191,29,164.32000732421875,167.36000061035156,'me more nervous. I don\'t know if that\'s weird.',40),(192,30,168.55999755859375,170.47999572753906,'Maybe. I think I\'m probably the opposite.',40),(193,31,171.0399932861328,171.44000244140625,'Really?',40),(194,32,172.16000366210938,178.8800048828125,'If I talk to people I don\'t know, I don\'t feel very confident unless I\'m very well prepared.',40),(195,33,178.8800048828125,184.24000549316406,'I think being prepared is a good way to boost your confidence.',40),(196,34,184.24000549316406,191.27999877929688,'Yeah. I remember watching a video about a lady saying if you want to improve your confidence,',40),(197,35,191.27999877929688,198.24000549316406,'to boost your confidence, you should stand in a power stance and think about all the',40),(198,36,198.24000549316406,203.60000610351562,'good things that you\'re going to do and it will make you confident with your hands on your hips.',40),(199,37,203.60000610351562,207.83999633789062,'And she said, if you\'re going to do public speaking or something that\'s really,',40),(200,38,208.47999572753906,213.27999877929688,'can be quite scary, she said even just go to the toilet, stand in the toilet',40),(201,39,214.32000732421875,218.47999572753906,'and do it on your own. And apparently, it increases your confidence.',40),(202,40,218.47999572753906,220,'Well, I must try that.',40),(203,41,220.72000122070312,226.32000732421875,'So, Neil, are there any situations where you wish you were more confident?',40),(204,42,227.27999877929688,233.83999633789062,'Um, maybe. I mean, I have a lot of experience of driving and I\'m quite confident driving,',40),(205,43,233.83999633789062,240.55999755859375,'but driving abroad, driving, especially in a foreign city, can be nerve wracking.',40),(206,44,242.72000122070312,248.72000122070312,'And yeah, I think it would be nice to be more confident driving abroad.',40),(207,45,249.44000244140625,255.60000610351562,'I was just thinking about language learning. I wish I was more confident when it came to',40),(208,46,255.67999267578125,261.67999267578125,'speaking, but I feel so shy and nervous if I\'m unless I\'m in, say, like a language class,',40),(209,47,261.67999267578125,266.1600036621094,'then I\'ll be OK. But if I\'m in the real world and I have to speak to someone in',40),(210,48,266.1600036621094,269.1199951171875,'Spanish, for example, I get really nervous.',40),(211,49,270.239990234375,276.79998779296875,'I have so much respect for people like our audience because they speak a foreign language',40),(212,50,276.79998779296875,282.239990234375,'and that\'s a really hard thing to do. Nerve wracking. You need confidence and, you know,',40),(213,51,283.20001220703125,286.0799865722656,'well done to you because it\'s not easy.',40),(214,52,286.0799865722656,287.1199951171875,'It\'s not easy at all.',40),(215,53,294.239990234375,298.79998779296875,'Let\'s recap some of the vocabulary we heard during the conversation.',40),(216,54,298.79998779296875,304.9599914550781,'We had confidence, which means certain or comfortable. And we also had the noun',40),(217,55,304.9599914550781,309.8399963378906,'confidence, which means that feeling or quality of being certain.',40),(218,56,309.8399963378906,315.67999267578125,'We heard the word shy, which describes a person who feels nervous or uncomfortable',40),(219,57,315.67999267578125,316.6400146484375,'around other people.',40),(220,58,317.5199890136719,321.9200134277344,'If something is nerve wracking, it\'s very stressful or worrying.',40),(221,59,322.6400146484375,326.7200012207031,'If something boosts your confidence, it makes you feel more confident.',40),(222,60,327.44000244140625,331.20001220703125,'And that\'s it for this episode of Real Easy English.',40),(223,61,331.20001220703125,336.55999755859375,'Head over to our website for more episodes bbclearningenglish.com.',40),(224,62,336.55999755859375,337.6000061035156,'Join us then.',40),(225,63,337.6000061035156,343.8399963378906,'Bye!',40);
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
  `beta_4` float DEFAULT '0.5',
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
INSERT INTO `spaced_config` VALUES (1,2.5,1,0.5,0.8,0.5,10,30);
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
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_tickets`
--

LOCK TABLES `support_tickets` WRITE;
/*!40000 ALTER TABLE `support_tickets` DISABLE KEYS */;
INSERT INTO `support_tickets` VALUES (1,NULL,'Tài khoản & đăng nhập','sadfghjhgfdsfghjkhgfdsasdfghj','Đã giải quyết','2026-04-20 16:31:22','nguyenminhthe2k4@gmail.com');
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
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả',
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1' COMMENT 'Trạng thái hoạt động',
  `created_at` datetime(6) DEFAULT NULL,
  `topic_image` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_topics_deleted_at` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES (3,'Từ vựng','Mô tả','Cơ bản',1,'2026-03-23 15:35:33.761114',NULL,NULL);
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
  `amount` double DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian giao dịch',
  `vnp_txn_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plan_id` bigint(20) DEFAULT NULL,
  `payment_trans_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `subscription_id` (`subscription_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (73,2,3,22222,'ZALOPAY','APPROVED','2026-04-20 02:46:56','260420_533658',3,NULL),(74,2,NULL,22222,'ZALOPAY','REJECTED','2026-04-21 21:15:30','260422_496499',3,NULL),(75,2,NULL,22222,'ZALOPAY','REJECTED','2026-04-21 21:16:18','260422_15368',3,NULL),(76,2,4,22222,'ZALOPAY','APPROVED','2026-04-21 22:58:20','260422_563312',3,NULL);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `target_id` int(11) NOT NULL,
  `target_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_favorite` (`user_id`,`target_id`,`target_type`),
  CONSTRAINT `fk_uf_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_favorites`
--

LOCK TABLES `user_favorites` WRITE;
/*!40000 ALTER TABLE `user_favorites` DISABLE KEYS */;
INSERT INTO `user_favorites` VALUES (1,2,2,'ARTICLE','2026-04-21 06:11:10'),(3,2,34,'VIDEO','2026-04-21 07:09:12'),(4,2,40,'VIDEO','2026-04-21 16:48:12');
/*!40000 ALTER TABLE `user_favorites` ENABLE KEYS */;
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
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh đại diện',
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_profile`
--

LOCK TABLES `user_profile` WRITE;
/*!40000 ALTER TABLE `user_profile` DISABLE KEYS */;
INSERT INTO `user_profile` VALUES (1,1,'Nguyen Minh The','',NULL),(2,2,'hongpham',NULL,NULL);
/*!40000 ALTER TABLE `user_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `target_id` int(11) NOT NULL,
  `target_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `progress_percent` double DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_progress` (`user_id`,`target_id`,`target_type`),
  CONSTRAINT `fk_up_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_progress`
--

LOCK TABLES `user_progress` WRITE;
/*!40000 ALTER TABLE `user_progress` DISABLE KEYS */;
INSERT INTO `user_progress` VALUES (1,2,34,'VIDEO',77.68413759825967,'2026-04-21 06:11:28'),(2,2,39,'VIDEO',18.18250216680399,'2026-04-21 08:35:55'),(3,2,40,'VIDEO',100,'2026-04-21 16:48:41'),(4,1,34,'VIDEO',2.0967095707760337,'2026-04-22 01:40:42'),(5,1,39,'VIDEO',2.0660759676062512,'2026-04-22 01:50:26');
/*!40000 ALTER TABLE `user_progress` ENABLE KEYS */;
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
  `total_study_time` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_stats`
--

LOCK TABLES `user_stats` WRITE;
/*!40000 ALTER TABLE `user_stats` DISABLE KEYS */;
INSERT INTO `user_stats` VALUES (1,2,11,0,96.8831,1,0.024065),(2,1,7,0,68.6364,1,0.173021);
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
  `is_premium` tinyint(1) DEFAULT '0',
  `daily_lookup_count` int(11) DEFAULT '0',
  `last_lookup_date` datetime DEFAULT NULL,
  `daily_download_count` int(11) DEFAULT NULL,
  `last_download_date` datetime DEFAULT NULL,
  `daily_video_download_count` int(11) DEFAULT NULL,
  `last_video_download_date` datetime DEFAULT NULL,
  `monthly_test_count` int(11) DEFAULT NULL,
  `last_test_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `premium_plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_subscriptions`
--

LOCK TABLES `user_subscriptions` WRITE;
/*!40000 ALTER TABLE `user_subscriptions` DISABLE KEYS */;
INSERT INTO `user_subscriptions` VALUES (1,1,3,'2026-04-16 16:15:42','2026-05-09 16:15:42','ACTIVE',0,2,'2026-04-26 11:49:02',NULL,NULL,NULL,NULL,NULL,NULL),(2,2,3,'2026-04-19 08:46:31',NULL,'FREE',0,3,'2026-04-19 08:46:31',NULL,NULL,NULL,NULL,NULL,NULL),(3,2,3,'2026-04-20 02:48:15','2026-04-21 15:39:35','CANCELED',0,9,'2026-04-21 22:45:37',NULL,NULL,NULL,NULL,NULL,NULL),(4,2,3,'2026-04-21 23:00:20','2026-05-14 23:00:20','ACTIVE',0,6,'2026-04-21 23:46:07',0,NULL,0,NULL,0,NULL);
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
  `word` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pronunciation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `part_of_speech` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meaning_en` text COLLATE utf8mb4_unicode_ci COMMENT 'Nghĩa tiếng Anh',
  `meaning_vi` text COLLATE utf8mb4_unicode_ci COMMENT 'Nghĩa tiếng Việt',
  `example` text COLLATE utf8mb4_unicode_ci COMMENT 'Ví dụ',
  `example_vi` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  `source_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_id` bigint(20) DEFAULT NULL,
  `level` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level_source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_vocabulary_custom_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vocabulary_custom`
--

LOCK TABLES `user_vocabulary_custom` WRITE;
/*!40000 ALTER TABLE `user_vocabulary_custom` DISABLE KEYS */;
INSERT INTO `user_vocabulary_custom` VALUES (1,1,'central','/ˈsɛntɹəl/','adjective','Being in the centre.','Tam dich: Being in the centre.','',NULL,'2026-04-01 02:28:20',NULL,NULL,NULL,NULL,NULL),(2,1,'price','praɪs','noun','the amount of money expected, required, or given in payment for something','số tiền mà người ta mong đợi, yêu cầu hoặc trả để mua một cái gì đó','• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.','Chi phí năng lượng: Giá xăng trung bình ở Mỹ đã đạt 4 đô la một gallon, cao nhất kể từ năm 2022. Trump nói vào thứ Ba rằng giá xăng sẽ nhanh chóng giảm xuống khi Mỹ hoàn tất hoạt động ở Iran. CNN đã báo cáo rằng việc kết thúc chiến tranh sẽ không có nghĩa là tiết kiệm ngay lập tức tại trạm xăng.','2026-04-17 09:11:56',NULL,NULL,NULL,NULL,'2026-04-17 09:11:56'),(3,1,'america','əˈmɛrɪkə','noun','A continent that includes countries in the Western Hemisphere, particularly referring to the regions of North America, Central America, and South America.','Một lục địa bao gồm các quốc gia ở bán cầu Tây, đặc biệt chỉ các khu vực Bắc Mỹ, Trung Mỹ và Nam Mỹ.','The growing humanization of pets in households across Latin America and the Caribbean is perhaps the most tangible symptom of a new generational change. Motherhood is no longer a presumed role, and birth rates are falling at an unprecedented pace.','Sự nhân hóa ngày càng tăng của thú cưng trong các hộ gia đình ở khắp Latin Mỹ và Caribbean có lẽ là triệu chứng rõ ràng nhất của một sự thay đổi thế hệ mới.','2026-04-17 16:04:30',NULL,NULL,NULL,NULL,'2026-04-17 16:04:30'),(4,1,'sociologist','ˌsəʊsiˈɒlədʒɪst','noun','a person who studies the development, structure, and functioning of human society','một người nghiên cứu sự phát triển, cấu trúc và chức năng của xã hội loài người','Every morning, on her way to the Pontifical Catholic University of Chile, sociologist Martina Yopo Díaz looks at the Vespucio Sur housing billboard as symptomatic of how “children, and reproduction in a broader sense, are occupying an increasingly marginal place in the life projects of younger generations.”','Mỗi sáng, trên đường đến Đại học Công giáo Pontifical Chile, nhà xã hội học Martina Yopo Díaz nhìn vào bảng quảng cáo nhà ở Vespucio Sur như một biểu hiện cho thấy \"trẻ em, và sự sinh sản theo một nghĩa rộng hơn, đang chiếm một vị trí ngày càng bên lề trong các dự án cuộc sống của các thế hệ trẻ hơn.\"','2026-04-17 16:11:44',NULL,NULL,NULL,NULL,'2026-04-17 16:11:44'),(5,1,'pro-natalist','prəʊˈneɪtɪst','adjective','relating to or advocating policies that encourage higher birth rates.','liên quan đến hoặc ủng hộ các chính sách khuyến khích tỷ lệ sinh cao hơn.','Experts tend to be cautious. Globally, countries that have implemented pro-natalist policies – bonuses, generous parental leave – have achieved, at best, modest or temporary increases.','Các chuyên gia thường thận trọng. Trên toàn cầu, những quốc gia đã thực hiện các chính sách pro-natalist – tiền thưởng, chế độ nghỉ phép cha mẹ hào phóng – đã đạt được, tốt nhất, những tăng trưởng khiêm tốn hoặc tạm thời.','2026-04-17 16:21:37',NULL,NULL,NULL,NULL,'2026-04-17 16:21:37'),(6,2,'communication',NULL,NULL,'The act or fact of communicating anything; transmission.','sự truyền đạt','communication of a secret','','2026-04-19 05:17:31',NULL,NULL,NULL,NULL,'2026-04-19 05:17:31'),(7,2,'come',NULL,NULL,'Coming, arrival; approach.','Đến, đến; tiếp cận.','The word \"come\" appears in this vocabulary note.','Từ \"đến\" xuất hiện trong ghi chú từ vựng này.','2026-04-19 09:01:07',NULL,NULL,'1','AI','2026-04-19 09:01:07'),(8,2,'prejudice',NULL,NULL,'An adverse judgment or opinion formed beforehand or without knowledge of the facts.','Một phán quyết hoặc ý kiến bất lợi được hình thành trước hoặc không có kiến thức về các sự kiện.','The word \"prejudice\" appears in this vocabulary note.','Từ \"định kiến\" xuất hiện trong ghi chú từ vựng này.','2026-04-20 14:21:14',NULL,NULL,'3','AI','2026-04-20 14:21:14'),(9,2,'soap',NULL,NULL,'A substance able to mix with both oil and water, used for cleaning, often in the form of a solid bar or in liquid form, derived from fats or made synthetically.','Chất có thể trộn với cả dầu và nước, được sử dụng để làm sạch, thường ở dạng thanh rắn hoặc ở dạng lỏng, có nguồn gốc từ chất béo hoặc được tổng hợp.','I tried washing my hands with soap, but the stain wouldn\'t go away.','Tôi đã thử rửa tay bằng xà phòng, nhưng vết bẩn vẫn không biến mất.','2026-04-20 14:22:46',NULL,NULL,'2','AI','2026-04-20 14:22:46'),(10,2,'interdisciplinary',NULL,NULL,'Of or pertaining to multiple distinct academic disciplines or fields of study.','Của hoặc liên quan đến nhiều ngành học hoặc lĩnh vực nghiên cứu riêng biệt.','This journal is interdisciplinary: it has articles on everything from biology to electrical engineering.','Tạp chí này có tính liên ngành: nó có các bài viết về mọi thứ từ sinh học đến kỹ thuật điện.','2026-04-20 14:34:03',NULL,NULL,'5','AI','2026-04-20 14:34:03'),(11,2,'interdisciplinary',NULL,NULL,'Of or pertaining to multiple distinct academic disciplines or fields of study.','Của hoặc liên quan đến nhiều ngành học hoặc lĩnh vực nghiên cứu riêng biệt.','This journal is interdisciplinary: it has articles on everything from biology to electrical engineering.','Tạp chí này có tính liên ngành: nó có các bài viết về mọi thứ từ sinh học đến kỹ thuật điện.','2026-04-20 14:37:50',NULL,NULL,'5','AI','2026-04-20 14:37:50'),(12,2,'operation','ˌɒpəˈreɪʃən','word','a planned activity involving many people that is done for a particular purpose','một hoạt động dự trù liên quan đến nhiều người được thực hiện với mục đích cụ thể','• Energy costs: The average US gas price hit $4 a gallon , the highest since 2022. Trump said Tuesday that gas prices will quickly go down once the US completes its operation in Iran. CNN has reported how an end to the war will not mean immediate savings at the pump.','The military operation in Iran was successful.','2026-04-20 15:21:30',NULL,NULL,NULL,NULL,'2026-04-20 15:21:30'),(13,2,'countries','null','word','political states that are sovereign in nature and commonly defined by borders, government, and population','quốc gia','• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','telling other countries to “go get your own oil.”','2026-04-20 15:35:39',NULL,NULL,NULL,NULL,'2026-04-20 15:35:39'),(14,2,'strait','/streɪt/','word','a narrow passage of water connecting two seas or two large areas of water','eo biển hẹp','• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced. It comes after Trump said Tuesday the US could be done with its war with Iran within two to three weeks . Washington will have “nothing to do with” the closed Strait of Hormuz , he added, telling other countries to “go get your own oil.”','The Strait of Hormuz is a crucial waterway for global oil shipments.','2026-04-20 15:50:57',NULL,NULL,NULL,NULL,'2026-04-20 15:50:57'),(15,2,'material',NULL,NULL,'Matter which may be shaped or manipulated, particularly in making something.','Vật chất có thể được định hình hoặc thao tác, đặc biệt là trong việc tạo ra một cái gì đó.','Asphalt, composed of oil and sand, is a widely used material for roads.','Nhựa đường, bao gồm dầu và cát, là một vật liệu được sử dụng rộng rãi cho các con đường.','2026-04-20 16:26:49',NULL,NULL,'4','AI','2026-04-20 16:26:49'),(16,2,'impediment','ɪmˈpɛdɪmənt','noun','a barrier; obstruction','chướng ngại vật','To determine how Bruce achieved such a high social standing even with a physical impediment, a team of researchers recently analyzed how Bruce interacted with other males in his group.','His injury was an impediment to his progress in the race.','2026-04-21 15:08:37',NULL,NULL,NULL,NULL,'2026-04-21 15:08:37'),(17,2,'after','/ˈæf.tə(ɹ)/',NULL,'Later; second (of two); next, following, subsequent','Sau đó; thứ hai (trong hai); tiếp theo, tiếp theo, tiếp theo','The word \"after\" appears in this vocabulary note.','Từ \"sau\" xuất hiện trong ghi chú từ vựng này.','2026-04-21 22:44:43',NULL,NULL,'2','AI','2026-04-21 22:44:43'),(18,2,'researchers','null','verb','to investigate systematically','nghiên cứu','To determine how Bruce achieved such a high social standing even with a physical impedimentimpediment [ɪmˈpɛdɪmənt]chướng ngại vật, a team of researchers recently analyzed how Bruce interacted with other males in his group.','She will research the topic before writing her paper.','2026-04-21 22:46:14',NULL,NULL,NULL,NULL,'2026-04-21 22:46:14'),(19,2,'quantum','[ˈkwɑɾ̃əm]',NULL,'The total amount of something; quantity.','Tổng số tiền của một cái gì đó; số lượng.','The word \"quantum\" appears in this vocabulary note.','Từ \"lượng tử\" xuất hiện trong ghi chú từ vựng này.','2026-04-21 22:49:32',NULL,NULL,'1','AI','2026-04-21 22:49:32'),(20,2,'address','əˈdrɛs','noun','a formal speech given to an audience','bài diễn văn','• A new timeline: President Donald Trump will deliver an address to the nation on Wednesday night regarding Iran, the White House announced.','The President delivered an address to the nation.','2026-04-21 22:56:35',NULL,NULL,NULL,NULL,'2026-04-21 22:56:35'),(21,1,'learn','lɜːrn','noun','to gain knowledge or skill by studying, practicing, or being taught','học','easy English to help you learn. I\'m Beth.','','2026-04-22 08:50:51',NULL,NULL,NULL,NULL,'2026-04-22 08:50:51');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_vocabulary_learning`
--

LOCK TABLES `user_vocabulary_learning` WRITE;
/*!40000 ALTER TABLE `user_vocabulary_learning` DISABLE KEYS */;
INSERT INTO `user_vocabulary_learning` VALUES (1,1,1,NULL,4,'2026-04-23 06:53:18','2026-04-29 12:13:18',1.42857,2,4,0),(2,1,2,NULL,2,'2026-04-25 07:49:57','2026-04-26 20:39:57',1.29412,2,7,2),(3,1,NULL,2,0,'2026-04-26 11:50:16','2026-04-26 14:14:16',1.5,2,4,1),(4,1,NULL,3,3,'2026-04-26 11:50:16','2026-04-30 20:45:16',1.3125,2,6,1),(5,1,NULL,4,0,'2026-04-26 11:50:16','2026-04-26 14:14:16',1.46667,2,5,2),(6,1,NULL,5,4,'2026-04-26 11:50:16','2026-05-02 13:19:16',1.4,2,5,1),(7,2,NULL,6,3,'2026-04-21 13:02:36','2026-04-25 12:32:36',1.53846,2,3,0),(8,2,NULL,7,2,'2026-04-23 06:51:53','2026-04-26 12:51:53',0.785714,1,4,1),(9,2,NULL,8,3,'2026-04-23 06:51:53','2026-04-27 04:51:53',1.53846,2,3,0),(10,2,NULL,12,2,'2026-04-21 13:02:36','2026-04-23 08:05:36',1.66667,2,2,0),(11,2,NULL,13,3,'2026-04-23 06:51:53','2026-04-27 06:43:53',1.53846,2,3,0),(12,2,NULL,14,2,'2026-04-21 13:02:36','2026-04-23 07:20:36',1.66667,2,2,0),(13,2,NULL,15,3,'2026-04-22 15:51:13','2026-04-25 20:31:13',1.92308,2.5,3,0),(14,2,NULL,16,2,'2026-04-21 23:01:09','2026-04-23 15:56:09',1.66667,2,2,0),(15,2,NULL,17,2,'2026-04-23 06:51:53','2026-04-25 15:59:53',1.23077,1.5,3,1),(16,2,NULL,18,2,'2026-04-22 15:51:13','2026-04-24 07:55:13',1.66667,2,2,0),(17,2,NULL,19,2,'2026-04-23 06:51:53','2026-04-26 08:35:53',0.833333,1,2,0),(18,1,NULL,21,3,'2026-04-25 07:49:58','2026-04-29 08:50:58',1.53846,2,3,0);
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
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Trạng thái hoạt động',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo tài khoản',
  `deleted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'nguyenminhthe2hk4','nguyenminhthe2hk4@gmail.com','$2a$10$PzfFkaZVS7EeFQPjQ2c6leA./i2RbNarjIMRzXy07PT.UVJEH.TaS','ADMIN',1,'2026-03-24 15:45:46',NULL),(2,'nguyenminhthe2k4','nguyenminhthe2k4@gmail.com','$2a$10$V5X6wtFyAicOmqupBmu4t.vLvVti/bQr8xurAbpnmc0cq0SrlP5/K','USER',1,'2026-04-17 13:19:01',NULL);
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
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `channel_id` (`channel_id`),
  KEY `idx_videos_deleted_at` (`deleted_at`),
  CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`channel_id`) REFERENCES `youtube_channels` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videos`
--

LOCK TABLES `videos` WRITE;
/*!40000 ALTER TABLE `videos` DISABLE KEYS */;
INSERT INTO `videos` VALUES (34,'Communication','https://youtu.be/Aj-EnsvU5Q0?si=lNjR-FJHRmj9dKQW','Hi, I\'m Neil. Thanks for joining me on English at Work, a new series of programs set in an office full of top tips to help you learn some useful business language which you could use in the workplace. In the next few minutes, you can join me on an introductory tour around one of London\'s biggest imitation plastic fruit manufacturers called Tip Top Trading. We\'re going to hear from some of the employees that work so hard to keep the business running smoothly. So come on then, let\'s step into the office and eavesdrop on Tip Top Trading\'s possible newest recruit. I say possible because she\'s still being interviewed for the job of sales executive. Firstly, this job is an ideal match for my skills and experience. I\'ve spent several years working in sales and I get on with people easily. Well, I mean, apart from the ones I don\'t like, of course. Secondly, I know Tip Top Trading is one of the fastest growing companies in London and I want to be part of that. That\'s absolutely right. Tip Top Trading is the fastest growing company in the plastic fruit sector. Well said, Anna. If she gets that job, I\'m sure she\'ll be an asset to the company. The decision is in the hands of manager Paul, who we heard there. He\'s a nice guy, really. Little disorganised, but when things go wrong, he\'s got to take charge. A bit like this. Yesterday was not a great day. Two clients came in with serious complaints. Mrs Kumquat received a delivery of imitation bananas that were purple. Not very convincing. And Mr Lime ordered grapefruits but got pineapples. Tom! Yeah, listen. Were you responsible for these errors? Well, yes, but Paul... Mistakes happen. But it seems that Mrs Kumquat left our offices even angrier than when she came in and she says she will never use Tip Top Trading again. I tried my best. Hmm. Ah, yes. Tom. I hadn\'t warned you about Tom. One of the company\'s top sales executives. He\'s good. Yeah, Tom speaking. Yeah, Frankie. So what\'s the latest? Are we on? But his interpersonal skills need working on. Listen to this. My computer has crashed. I\'ve lost my phone. And there\'s a big, big problem with my timetable. I\'ve got two meetings scheduled at the same time with two extremely important clients. I can\'t do them both at once. See what I mean? Now, every office needs a good office assistant. And Tip Top Trading is no exception. It\'s got Denise, who\'s there to assist, organise and sometimes make the tea. Oh, sorry. Excuse me. Here\'s your tea, Paul. Oh, thanks, Denise. Goodness, she likes to talk. Really? Denise, do this. Denise, do that. I\'m telling you, Sharon, I\'ve almost had enough. I get treated like some kind of servant. That\'s Denise. I think we\'ll just leave the office now and let them get on with their work. So that\'s Tip Top Trading. They\'re a plenty of other people we\'ll meet along the way. So go on. Why don\'t you join me for English at Work from bbclearningenglish.com. See ya!',1,'B1','3:58',0,'Công khai','https://res.cloudinary.com/dfio1duaf/video/upload/v1776573923/datn-videos/lpzeeenjyateqd32stmm.mp4','DONE',NULL),(35,'Would you sign a prenup before marriage? - What in the World podcast, BBC World Service','https://youtu.be/mPK2WTU8joY?si=RRJOV49E4XomraVJ',NULL,1,'Trung bình','12:11',0,'Công khai','https://res.cloudinary.com/dfio1duaf/video/upload/v1776784313/datn-videos/fgsqq13m8tmpxhvpxesg.mp4','PROCESSING','2026-04-21 22:29:36'),(36,'Would you sign a prenup before marriage? - What in the World podcast, BBC World Service','https://youtu.be/mPK2WTU8joY?si=RRJOV49E4XomraVJ',NULL,1,'Trung bình','12:11',0,'Công khai','https://res.cloudinary.com/dfio1duaf/video/upload/v1776785136/datn-videos/tl7pqvkxsfvyrlp098al.mp4','PROCESSING','2026-04-21 22:27:33'),(37,'Would you sign a prenup before marriage? - What in the World podcast, BBC World Service','https://youtu.be/mPK2WTU8joY?si=RRJOV49E4XomraVJ',NULL,1,'Trung bình','12:11',0,'Công khai','https://res.cloudinary.com/dfio1duaf/video/upload/v1776785307/datn-videos/ilaksficnaicn5f5mzdp.mp4','PROCESSING','2026-04-21 22:29:34'),(38,'https://youtu.be/mPK2WTU8joY?si=RRJOV49E4XomraVJ','https://youtu.be/mPK2WTU8joY?si=RRJOV49E4XomraVJ',NULL,1,'B1','12:11',0,'Công khai','https://res.cloudinary.com/dfio1duaf/video/upload/v1776785431/datn-videos/jwbrsdcofc4tizcc8hyn.mp4','PROCESSING','2026-04-21 22:32:19'),(39,'Talking about confidence ???Real Easy English','https://youtu.be/gL6DT-PdLoQ?si=rS6lHnkOIFAyi84o','Hello and welcome to Real Easy English, the podcast where we have real conversations in easy English to help you learn. I\'m Beth. And I\'m Neil. You can watch this podcast and test yourself with a worksheet which you can get free on our website at bbclearningenglish.com. So, Neil, how are you today? I\'m very well, actually. How are you feeling about our recording today? Feeling confident? I\'m feeling confident. Are you feeling nervous? Not at all. No, I\'m feeling confident. Well, today we\'re talking all about confidence. So, listeners might be familiar with the adjective confidence, which means being certain about something, feeling good about yourself. But confidence is the noun and it\'s that feeling of being certain, maybe about your own abilities or about a situation. OK, that\'s a good description, Beth. Would you say you are a confident person? I think it really depends on the situation. So, if I am speaking with you like this, I\'m very confident. I know you. But if I\'m around people that I don\'t know as much, then I usually feel a bit more shy. Yeah. What about you? Are you generally confident? I think, like you, if I think I know what I\'m doing, then I\'m confident. But if I\'m doing something, especially with people who maybe know more about that thing than I do, then that can be nerve wracking, make you feel nervous and then not be confident. Yeah, definitely. I remember like being in a class in a classroom and if I feel like this topic is just, I don\'t know, then I would not feel confident at all. Definitely feel nervous. What other types of situations would make you feel shy or nervous? I think apart from meeting new people, I always feel a bit nervous with that. I\'m generally quite confident. So, if it comes to something like public speaking, where I have to talk in front of a lot of people, if they\'re people I don\'t know, I don\'t really have a problem. I\'m quite confident. But if I had to speak to a room of people and I know the people, that would make me more nervous. I don\'t know if that\'s weird. Maybe. I think I\'m probably the opposite. Really? If I talk to people I don\'t know, I don\'t feel very confident unless I\'m very well prepared. I think being prepared is a good way to boost your confidence. Yeah. I remember watching a video about a lady saying if you want to improve your confidence, to boost your confidence, you should stand in a power stance and think about all the good things that you\'re going to do and it will make you confident with your hands on your hips. And she said, if you\'re going to do public speaking or something that\'s really, can be quite scary, she said even just go to the toilet, stand in the toilet and do it on your own. And apparently, it increases your confidence. Well, I must try that. So, Neil, are there any situations where you wish you were more confident? Um, maybe. I mean, I have a lot of experience of driving and I\'m quite confident driving, but driving abroad, driving, especially in a foreign city, can be nerve wracking. And yeah, I think it would be nice to be more confident driving abroad. I was just thinking about language learning. I wish I was more confident when it came to speaking, but I feel so shy and nervous if I\'m unless I\'m in, say, like a language class, then I\'ll be OK. But if I\'m in the real world and I have to speak to someone in Spanish, for example, I get really nervous. I have so much respect for people like our audience because they speak a foreign language and that\'s a really hard thing to do. Nerve wracking. You need confidence and, you know, well done to you because it\'s not easy. It\'s not easy at all. Let\'s recap some of the vocabulary we heard during the conversation. We had confidence, which means certain or comfortable. And we also had the noun confidence, which means that feeling or quality of being certain. We heard the word shy, which describes a person who feels nervous or uncomfortable around other people. If something is nerve wracking, it\'s very stressful or worrying. If something boosts your confidence, it makes you feel more confident. And that\'s it for this episode of Real Easy English. Head over to our website for more episodes bbclearningenglish.com. Join us then. Bye!',1,'B2','5:44',0,'Công khai','https://res.cloudinary.com/dfio1duaf/video/upload/v1776785651/datn-videos/uaspajeszgwkjnhkfj5b.mp4','DONE','2026-04-22 15:54:29'),(40,'Talking about confidence ???Real Easy English','https://youtu.be/gL6DT-PdLoQ?si=rS6lHnkOIFAyi84o','Hello and welcome to Real Easy English, the podcast where we have real conversations in easy English to help you learn. I\'m Beth. And I\'m Neil. You can watch this podcast and test yourself with a worksheet which you can get free on our website at bbclearningenglish.com. So, Neil, how are you today? I\'m very well, actually. How are you feeling about our recording today? Feeling confident? I\'m feeling confident. Are you feeling nervous? Not at all. No, I\'m feeling confident. Well, today we\'re talking all about confidence. So, listeners might be familiar with the adjective confidence, which means being certain about something, feeling good about yourself. But confidence is the noun and it\'s that feeling of being certain, maybe about your own abilities or about a situation. OK, that\'s a good description, Beth. Would you say you are a confident person? I think it really depends on the situation. So, if I am speaking with you like this, I\'m very confident. I know you. But if I\'m around people that I don\'t know as much, then I usually feel a bit more shy. Yeah. What about you? Are you generally confident? I think, like you, if I think I know what I\'m doing, then I\'m confident. But if I\'m doing something, especially with people who maybe know more about that thing than I do, then that can be nerve wracking, make you feel nervous and then not be confident. Yeah, definitely. I remember like being in a class in a classroom and if I feel like this topic is just, I don\'t know, then I would not feel confident at all. Definitely feel nervous. What other types of situations would make you feel shy or nervous? I think apart from meeting new people, I always feel a bit nervous with that. I\'m generally quite confident. So, if it comes to something like public speaking, where I have to talk in front of a lot of people, if they\'re people I don\'t know, I don\'t really have a problem. I\'m quite confident. But if I had to speak to a room of people and I know the people, that would make me more nervous. I don\'t know if that\'s weird. Maybe. I think I\'m probably the opposite. Really? If I talk to people I don\'t know, I don\'t feel very confident unless I\'m very well prepared. I think being prepared is a good way to boost your confidence. Yeah. I remember watching a video about a lady saying if you want to improve your confidence, to boost your confidence, you should stand in a power stance and think about all the good things that you\'re going to do and it will make you confident with your hands on your hips. And she said, if you\'re going to do public speaking or something that\'s really, can be quite scary, she said even just go to the toilet, stand in the toilet and do it on your own. And apparently, it increases your confidence. Well, I must try that. So, Neil, are there any situations where you wish you were more confident? Um, maybe. I mean, I have a lot of experience of driving and I\'m quite confident driving, but driving abroad, driving, especially in a foreign city, can be nerve wracking. And yeah, I think it would be nice to be more confident driving abroad. I was just thinking about language learning. I wish I was more confident when it came to speaking, but I feel so shy and nervous if I\'m unless I\'m in, say, like a language class, then I\'ll be OK. But if I\'m in the real world and I have to speak to someone in Spanish, for example, I get really nervous. I have so much respect for people like our audience because they speak a foreign language and that\'s a really hard thing to do. Nerve wracking. You need confidence and, you know, well done to you because it\'s not easy. It\'s not easy at all. Let\'s recap some of the vocabulary we heard during the conversation. We had confidence, which means certain or comfortable. And we also had the noun confidence, which means that feeling or quality of being certain. We heard the word shy, which describes a person who feels nervous or uncomfortable around other people. If something is nerve wracking, it\'s very stressful or worrying. If something boosts your confidence, it makes you feel more confident. And that\'s it for this episode of Real Easy English. Head over to our website for more episodes bbclearningenglish.com. Join us then. Bye!',1,'B2','5:44',0,'Công khai','https://res.cloudinary.com/dfio1duaf/video/upload/v1776814813/datn-videos/laovsb0jctlwu1lstty9.mp4','DONE',NULL);
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
  `word` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pronunciation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `part_of_speech` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meaning_en` text COLLATE utf8mb4_unicode_ci COMMENT 'Định nghĩa tiếng Anh',
  `meaning_vi` text COLLATE utf8mb4_unicode_ci COMMENT 'Nghĩa tiếng Việt',
  `example` text COLLATE utf8mb4_unicode_ci COMMENT 'Câu ví dụ',
  `example_vi` text COLLATE utf8mb4_unicode_ci,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_channels_deleted_at` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `youtube_channels`
--

LOCK TABLES `youtube_channels` WRITE;
/*!40000 ALTER TABLE `youtube_channels` DISABLE KEYS */;
INSERT INTO `youtube_channels` VALUES (1,'BBC Learning English','https://www.youtube.com/@bbc','General',NULL,NULL,NULL,NULL,1,NULL);
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

-- Dump completed on 2026-04-26 19:42:28
