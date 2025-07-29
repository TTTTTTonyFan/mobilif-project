-- 为gym表添加新字段的迁移脚本
-- 添加场馆类型和支持的课程类型字段

-- 1. 添加gym_type字段
ALTER TABLE `gyms` 
ADD COLUMN `gym_type` ENUM('crossfit_certified', 'comprehensive', 'specialty') DEFAULT 'comprehensive' AFTER `featured`;

-- 2. 添加crossfit_certified字段
ALTER TABLE `gyms` 
ADD COLUMN `crossfit_certified` BOOLEAN DEFAULT FALSE AFTER `gym_type`;

-- 3. 添加supported_programs字段
ALTER TABLE `gyms` 
ADD COLUMN `supported_programs` JSON AFTER `crossfit_certified`;

-- 4. 为新字段创建索引
CREATE INDEX `idx_gym_type` ON `gyms` (`gym_type`);
CREATE INDEX `idx_crossfit_certified` ON `gyms` (`crossfit_certified`);

-- 5. 更新现有数据（如果有的话）
-- 为CrossFit认证场馆设置相应字段
UPDATE `gyms` 
SET 
  `gym_type` = 'crossfit_certified',
  `crossfit_certified` = TRUE,
  `supported_programs` = JSON_ARRAY('CrossFit', 'Olympic Lifting', 'Gymnastics')
WHERE `name` LIKE '%CrossFit%' OR `tags` LIKE '%crossfit%';

-- 为综合训练馆设置支持的课程
UPDATE `gyms` 
SET 
  `supported_programs` = JSON_ARRAY('CrossFit', 'Olympic Lifting', 'Functional Fitness', 'Powerlifting')
WHERE `gym_type` = 'comprehensive' AND `supported_programs` IS NULL;

-- 为专项训练馆设置支持的课程  
UPDATE `gyms` 
SET 
  `supported_programs` = JSON_ARRAY('Olympic Lifting', 'Powerlifting')
WHERE `gym_type` = 'specialty' AND `supported_programs` IS NULL;