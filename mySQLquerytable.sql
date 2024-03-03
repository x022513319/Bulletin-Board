CREATE DATABASE `task2`;
SHOW DATABASES;
USE `task2`;
CREATE TABLE `users`(
	uid int AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    psword VARCHAR(255) NOT NULL,
    signupTime TIMESTAMP
);

CREATE TABLE `posts`(
	pid int AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(2048) NOT NULL,
    postTime TIMESTAMP,
    user_id INT,
    FOREIGN KEY(user_id) REFERENCES users(uid)
);

SELECT * FROM `users`;
SELECT * FROM `posts`;
DELETE FROM `users` LIMIT 100;
DELETE FROM `users` WHERE `uid` = 8;
ALTER TABLE `posts` DROP FOREIGN KEY `posts_ibfk_1`; 
ALTER TABLE `posts` DROP COLUMN `user_id`;

CREATE INDEX idx_email ON users (email);
ALTER TABLE `posts` ADD COLUMN `user_email` VARCHAR(255), ADD CONSTRAINT `fk_user_email` FOREIGN KEY (`user_email`) REFERENCES `users`(`email`);

INSERT INTO `posts` (`content`, `user_email`) VALUES ('this is a test', 'case');
SELECT CONVERT_TZ(NOW(), 'UTC', 'Asia/Taipei');

ALTER DATABASE `task2` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `users` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `posts` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE posts MODIFY COLUMN content VARCHAR(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



SHOW CREATE TABLE posts;
ALTER TABLE `posts` DROP FOREIGN KEY `fk_user_email`;
ALTER TABLE `posts` ADD CONSTRAINT `fk_user_email` FOREIGN KEY (`user_email`) REFERENCES `users`(`email`);
SET NAMES utf8mb4;