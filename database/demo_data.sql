-- Demo Data for School Management System
-- Insert sample data for testing

USE school_management;

-- Insert admin user (password: admin123)
-- Use REPLACE INTO to update if user already exists (for password reset)
-- This hash is generated using PHP password_hash('admin123', PASSWORD_BCRYPT)
REPLACE INTO users (email, password, role) VALUES 
('admin@school.com', '$2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin');

-- Insert General Settings (REPLACE to update if exists)
REPLACE INTO settings_general (id, school_name, school_name_bn, school_code, website_info, website_info_bn) VALUES 
('general', 'Alalpur High School', 'আলালপুর উচ্চ বিদ্যালয়', 'AHS001', 'A leading educational institution', 'একটি শীর্ষস্থানীয় শিক্ষা প্রতিষ্ঠান');

-- Insert Head Settings (REPLACE to update if exists)
REPLACE INTO settings_head (id, name, name_bn, designation, designation_bn, quote, quote_bn) VALUES 
('head', 'Dr. Mohammad Ali', 'ড. মোহাম্মদ আলী', 'Headmaster', 'প্রধান শিক্ষক', 
'Education is the most powerful weapon which you can use to change the world.', 
'শিক্ষা হল সবচেয়ে শক্তিশালী অস্ত্র যা দিয়ে আপনি বিশ্বকে পরিবর্তন করতে পারেন।');

-- Insert Homepage Settings (REPLACE to update if exists)
REPLACE INTO settings_homepage (id, slider_images, featured_sections, gallery) VALUES 
('homepage', '[]', '["notices", "posts", "teachers"]', '[]');

-- Insert Sample Teachers (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO teachers (name, name_bn, designation, designation_bn, qualification, experience, email, phone, bio, bio_bn, published) VALUES
('Abdul Karim', 'আব্দুল করিম', 'Senior Teacher', 'সিনিয়র শিক্ষক', 'M.A., B.Ed.', '15 years', 'karim@school.com', '01712345678', 'Experienced teacher in Mathematics', 'গণিতে অভিজ্ঞ শিক্ষক', TRUE),
('Fatema Begum', 'ফাতেমা বেগম', 'Assistant Teacher', 'সহকারী শিক্ষক', 'M.A., B.Ed.', '10 years', 'fatema@school.com', '01712345679', 'Specialized in Bengali Literature', 'বাংলা সাহিত্যে বিশেষজ্ঞ', TRUE),
('Rashidul Hasan', 'রশিদুল হাসান', 'Senior Teacher', 'সিনিয়র শিক্ষক', 'M.Sc., B.Ed.', '12 years', 'rashid@school.com', '01712345680', 'Physics and Chemistry expert', 'পদার্থবিদ্যা ও রসায়নে বিশেষজ্ঞ', TRUE),
('Nazma Akter', 'নাজমা আক্তার', 'Assistant Teacher', 'সহকারী শিক্ষক', 'B.A., B.Ed.', '8 years', 'nazma@school.com', '01712345681', 'English Language teacher', 'ইংরেজি ভাষা শিক্ষক', TRUE),
('Mohammad Shahid', 'মোহাম্মদ শাহিদ', 'Senior Teacher', 'সিনিয়র শিক্ষক', 'M.Com., B.Ed.', '14 years', 'shahid@school.com', '01712345682', 'Commerce and Accounting specialist', 'বাণিজ্য ও হিসাববিজ্ঞানে বিশেষজ্ঞ', TRUE);

-- Insert Sample Students (INSERT IGNORE to skip duplicates)
-- Note: students table doesn't have 'published' column
INSERT IGNORE INTO students (name, name_bn, class, roll, admission_year, father_name, mother_name, phone) VALUES
('Rahim Uddin', 'রহিম উদ্দিন', 'Class 10', '101', '2020', 'Karim Uddin', 'Fatema Begum', '01712345690'),
('Sultana Begum', 'সুলতানা বেগম', 'Class 10', '102', '2020', 'Abdul Hamid', 'Rashida Begum', '01712345691'),
('Kamal Hossain', 'কামাল হোসেন', 'Class 9', '201', '2021', 'Jamal Hossain', 'Rokeya Begum', '01712345692'),
('Fatema Khatun', 'ফাতেমা খাতুন', 'Class 9', '202', '2021', 'Rafiqul Islam', 'Shahida Begum', '01712345693'),
('Tariqul Islam', 'তারিকুল ইসলাম', 'Class 8', '301', '2022', 'Mofizul Islam', 'Nasima Begum', '01712345694');

-- Insert Sample Support Staff (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO support_staff (name, name_bn, role, role_bn, phone, email, published) VALUES
('Abdul Malek', 'আব্দুল মালেক', 'Office Assistant', 'অফিস সহকারী', '01712345700', 'malek@school.com', TRUE),
('Rokeya Begum', 'রোকেয়া বেগম', 'Librarian', 'গ্রন্থাগারিক', '01712345701', 'rokeya@school.com', TRUE),
('Shahidul Islam', 'শাহিদুল ইসলাম', 'Security Guard', 'নিরাপত্তা প্রহরী', '01712345702', 'shahidul@school.com', TRUE),
('Nasima Akter', 'নাসিমা আক্তার', 'Cleaner', 'পরিচ্ছন্নতা কর্মী', '01712345703', 'nasima@school.com', TRUE);

-- Insert Sample Committee Members (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO committee (name, name_bn, designation, designation_bn, bio, bio_bn, published) VALUES
('Dr. Mohammad Ali', 'ড. মোহাম্মদ আলী', 'President', 'সভাপতি', 'Headmaster of the school', 'বিদ্যালয়ের প্রধান শিক্ষক', TRUE),
('Advocate Karim Uddin', 'অ্যাডভোকেট করিম উদ্দিন', 'Vice President', 'সহ-সভাপতি', 'Legal advisor', 'আইনি পরামর্শদাতা', TRUE),
('Engineer Rashidul Hasan', 'ইঞ্জিনিয়ার রশিদুল হাসান', 'Member', 'সদস্য', 'Engineering professional', 'ইঞ্জিনিয়ারিং পেশাদার', TRUE),
('Mrs. Fatema Begum', 'মিসেস ফাতেমা বেগম', 'Member', 'সদস্য', 'Educationist', 'শিক্ষাবিদ', TRUE);

-- Insert Sample Alumni (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO alumni (name, name_bn, graduation_year, current_position, current_position_bn, achievement, achievement_bn, published) VALUES
('Dr. Mohammad Hasan', 'ড. মোহাম্মদ হাসান', '2010', 'Medical Doctor', 'চিকিৎসক', 'Completed MBBS from Dhaka Medical College', 'ঢাকা মেডিকেল কলেজ থেকে এমবিবিএস সম্পন্ন', TRUE),
('Engineer Fatema Khatun', 'ইঞ্জিনিয়ার ফাতেমা খাতুন', '2012', 'Software Engineer', 'সফটওয়্যার ইঞ্জিনিয়ার', 'Working at a leading tech company', 'একটি শীর্ষস্থানীয় প্রযুক্তি কোম্পানিতে কাজ করছেন', TRUE),
('Advocate Kamal Uddin', 'অ্যাডভোকেট কামাল উদ্দিন', '2008', 'Lawyer', 'আইনজীবী', 'Practicing law at Supreme Court', 'সুপ্রিম কোর্টে আইন চর্চা করছেন', TRUE),
('Professor Rashida Begum', 'অধ্যাপক রশিদা বেগম', '2005', 'University Professor', 'বিশ্ববিদ্যালয়ের অধ্যাপক', 'Teaching at Dhaka University', 'ঢাকা বিশ্ববিদ্যালয়ে শিক্ষকতা করছেন', TRUE);

-- Insert Sample Notices (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO notices (title, description, published, created_at) VALUES
('Annual Sports Day', 'The annual sports day will be held on 15th December. All students are requested to participate.', TRUE, NOW()),
('Parent-Teacher Meeting', 'A parent-teacher meeting will be held on 20th December at 10 AM. All parents are requested to attend.', TRUE, NOW()),
('Holiday Notice', 'The school will remain closed on 16th December for Victory Day.', TRUE, NOW()),
('Exam Schedule', 'Mid-term examination will start from 1st January. Please prepare accordingly.', TRUE, NOW()),
('Library Notice', 'New books have been added to the library. Students can borrow books from tomorrow.', TRUE, NOW());

-- Insert Sample Posts (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO posts (title, title_bn, description, description_bn, category, category_bn, published, created_at) VALUES
('School Annual Day Celebration', 'বিদ্যালয়ের বার্ষিক দিবস উদযাপন', 
'The school celebrated its annual day with great enthusiasm. Students performed various cultural programs.', 
'বিদ্যালয়টি মহা উৎসাহের সাথে তার বার্ষিক দিবস উদযাপন করেছে। শিক্ষার্থীরা বিভিন্ন সাংস্কৃতিক অনুষ্ঠান করেছে।', 
'Event', 'অনুষ্ঠান', TRUE, NOW()),
('Science Fair 2024', 'বিজ্ঞান মেলা ২০২৪', 
'Our students participated in the district science fair and won several prizes.', 
'আমাদের শিক্ষার্থীরা জেলা বিজ্ঞান মেলায় অংশগ্রহণ করেছে এবং বেশ কয়েকটি পুরস্কার জিতেছে।', 
'Achievement', 'অর্জন', TRUE, NOW()),
('New Computer Lab Inauguration', 'নতুন কম্পিউটার ল্যাব উদ্বোধন', 
'The new computer lab with 30 computers has been inaugurated today.', 
'৩০টি কম্পিউটার সহ নতুন কম্পিউটার ল্যাব আজ উদ্বোধন করা হয়েছে।', 
'Infrastructure', 'অবকাঠামো', TRUE, NOW()),
('Student Exchange Program', 'শিক্ষার্থী বিনিময় কর্মসূচি', 
'Five students from our school will visit Japan next month for an exchange program.', 
'আমাদের বিদ্যালয়ের পাঁচজন শিক্ষার্থী আগামী মাসে বিনিময় কর্মসূচির জন্য জাপান সফর করবে।', 
'Program', 'কর্মসূচি', TRUE, NOW());

-- Insert Sample Routines (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO routines (title, title_bn, type, class, published, created_at) VALUES
('Class 10 Routine', 'দশম শ্রেণির রুটিন', 'class', 'Class 10', TRUE, NOW()),
('Class 9 Routine', 'নবম শ্রেণির রুটিন', 'class', 'Class 9', TRUE, NOW()),
('Annual Exam Routine', 'বার্ষিক পরীক্ষার রুটিন', 'exam', NULL, TRUE, NOW());

-- Insert Sample Results (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO results (title, title_bn, exam_name, exam_name_bn, session, published, published_at, created_at) VALUES
('SSC Exam Result 2023', 'এসএসসি পরীক্ষার ফলাফল ২০২৩', 'SSC', 'এসএসসি', '2023', TRUE, NOW(), NOW()),
('JSC Exam Result 2023', 'জেএসসি পরীক্ষার ফলাফল ২০২৩', 'JSC', 'জেএসসি', '2023', TRUE, NOW(), NOW()),
('Mid-term Exam Result', 'মধ্যবর্তী পরীক্ষার ফলাফল', 'Mid-term', 'মধ্যবর্তী', '2024', TRUE, NOW(), NOW());

-- Insert Sample Pages (INSERT IGNORE to skip duplicates - URL is unique)
INSERT IGNORE INTO pages (title, title_bn, description, description_bn, url, published, created_at) VALUES
('About Us', 'আমাদের সম্পর্কে', 
'Learn more about our school history, mission, and vision.', 
'আমাদের বিদ্যালয়ের ইতিহাস, মিশন এবং ভিশন সম্পর্কে আরও জানুন।', 
'about', TRUE, NOW()),
('Admission', 'ভর্তি', 
'Information about admission process and requirements.', 
'ভর্তি প্রক্রিয়া এবং প্রয়োজনীয়তা সম্পর্কে তথ্য।', 
'admission', TRUE, NOW()),
('Contact Us', 'যোগাযোগ', 
'Get in touch with us for any queries or information.', 
'যেকোনো প্রশ্ন বা তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।', 
'contact', TRUE, NOW());

-- Insert Sample Classes (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO classes (name, name_bn, capacity, status, subjects, sections) VALUES
('Class 6', 'ষষ্ঠ শ্রেণি', 40, 'active', '["Bengali", "English", "Mathematics", "Science"]', '["A", "B"]'),
('Class 7', 'সপ্তম শ্রেণি', 40, 'active', '["Bengali", "English", "Mathematics", "Science"]', '["A", "B"]'),
('Class 8', 'অষ্টম শ্রেণি', 40, 'active', '["Bengali", "English", "Mathematics", "Science"]', '["A", "B"]'),
('Class 9', 'নবম শ্রেণি', 40, 'active', '["Bengali", "English", "Mathematics", "Physics", "Chemistry"]', '["A", "B"]'),
('Class 10', 'দশম শ্রেণি', 40, 'active', '["Bengali", "English", "Mathematics", "Physics", "Chemistry"]', '["A", "B"]');

-- Insert Sample Admission Applications (INSERT IGNORE to skip duplicates)
INSERT IGNORE INTO admission_applications (student_name, student_name_bn, father_name, mother_name, date_of_birth, gender, address, phone, applied_class, status, created_at) VALUES
('Rahim Ali', 'রহিম আলী', 'Karim Ali', 'Fatema Begum', '2015-05-15', 'male', 'Village: Alalpur, District: Comilla', '01712345900', 'Class 6', 'pending', NOW()),
('Sultana Khatun', 'সুলতানা খাতুন', 'Abdul Hamid', 'Rashida Begum', '2015-08-20', 'female', 'Village: Alalpur, District: Comilla', '01712345901', 'Class 6', 'pending', NOW()),
('Kamal Hossain', 'কামাল হোসেন', 'Jamal Hossain', 'Rokeya Begum', '2014-03-10', 'male', 'Village: Alalpur, District: Comilla', '01712345902', 'Class 7', 'approved', NOW());

