-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2026 at 08:08 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rancon_facilities`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('Super Admin','Project Admin') DEFAULT 'Project Admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `phone`, `password`, `avatar`, `role`, `created_at`) VALUES
(1, 'Super Admin', 'admin@rpml.com.bd', '01711141183', '123456', 'uploads/1766125644496-705124661.jpg', 'Super Admin', '2025-12-15 11:09:50'),
(2, 'Thaminul Tazbir', 'tazbir@rpl.com.bd', '01322909714', 'Rancon@#321', 'uploads/1766297166952-627682241.jpg', 'Project Admin', '2025-12-21 06:05:05');

-- --------------------------------------------------------

--
-- Table structure for table `admin_assignments`
--

CREATE TABLE `admin_assignments` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `building_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_assignments`
--

INSERT INTO `admin_assignments` (`id`, `admin_id`, `building_id`) VALUES
(2, 2, 13);

-- --------------------------------------------------------

--
-- Table structure for table `buildings`
--

CREATE TABLE `buildings` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('Residential','Commercial') NOT NULL,
  `total_floors` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_units` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `buildings`
--

INSERT INTO `buildings` (`id`, `name`, `type`, `total_floors`, `created_at`, `total_units`) VALUES
(13, 'Rangs Babylonia', 'Commercial', 16, '2026-01-05 07:19:14', 21),
(14, 'Rangs Miranda', 'Residential', 15, '2026-01-13 05:45:31', 15),
(15, 'Rangs Merisa', 'Residential', 12, '2026-01-14 11:50:30', 30),
(16, '215 Premises', 'Commercial', 3, '2026-01-19 10:15:16', 4);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` int(11) NOT NULL,
  `emp_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `contact` varchar(50) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `emp_id`, `name`, `role`, `contact`, `status`, `created_at`) VALUES
(2, '16745', 'Ahad Hossain', 'Manager', '01322909714', 'Active', '2025-12-15 09:26:15'),
(3, '18234', 'Emon Barua', 'Support Agent', '01921355333', 'Active', '2025-12-15 09:27:33'),
(4, '17856', 'Jony Paul', 'Support Agent', '01322909856', 'Active', '2025-12-23 10:01:40'),
(5, '12345', 'Galib Hasan', 'Support Agent', '01788453212', 'Active', '2026-01-14 11:49:57');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `building_type` enum('Residential','Commercial') NOT NULL,
  `building_name` varchar(100) NOT NULL,
  `floor` varchar(50) NOT NULL,
  `apartment` varchar(50) NOT NULL,
  `category` varchar(100) NOT NULL,
  `details` text NOT NULL,
  `status` enum('Pending','In Progress','Resolved') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_to` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `name`, `contact`, `building_type`, `building_name`, `floor`, `apartment`, `category`, `details`, `status`, `created_at`, `assigned_to`) VALUES
(1, 'Thaminul Tazbir', '01996123497', 'Residential', 'Rangs Diorama', 'Level 1', '1A', 'Parking Arrangement', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing', 'Pending', '2025-12-15 09:01:35', 3),
(2, 'Rubaiyat Oshin', '01322909714', 'Commercial', 'Rangs Babylonia', '7', 'Helio', 'Material Concern', 'Hello, No need to Call me', 'Resolved', '2025-12-18 06:58:09', 2),
(3, 'Raton', '01918513982', 'Residential', 'Merisa', '3', 'A3', 'Maintenance Support', 'One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to', 'Pending', '2025-12-19 08:23:43', NULL),
(4, 'Saiful Islam', '01566781234', 'Residential', 'Merisa', '3', 'A3', 'Maintenance Support', 'Hellolkgfsdlg', 'Pending', '2025-12-21 06:55:10', NULL),
(5, 'Saiful Islam', '01522308524', 'Residential', 'Rangs Babylonia', '8', 'Young Level', 'Material Concern', 'Shjsksnsbsj', 'Pending', '2025-12-21 06:57:25', NULL),
(6, 'Saiful Islam', '01566781234', 'Residential', 'Merisa', '3', 'A3', 'Maintenance Support', 'Hellolkgfsdlg', 'Pending', '2025-12-21 06:58:09', NULL),
(7, 'Saiful Islam', '01522308524', 'Residential', 'Rangs Babylonia', '6', 'Symphony', 'Maintenance Support', 'Bfkjfgxgjzf', 'Pending', '2025-12-21 07:04:49', NULL),
(8, 'Khalid Bhai', '01755231578', 'Residential', 'Rangs Babylonia', '7', 'Helio', 'Agreement Clarification', 'Hsjsnsbzhjsbsh', 'Pending', '2025-12-21 07:57:36', NULL),
(9, 'Sajid Quayyum', '01707007380', 'Residential', 'Rangs Babylonia', '11', 'Rangs Properties', 'Parking Arrangement', 'Parking area conjusted due to additional vehicle kept.', 'In Progress', '2025-12-22 06:19:10', 2),
(10, 'Hasan Parver', '01522308524', 'Residential', 'Rangs Babylonia', '11', 'Rangs Properties Limited', 'Maintenance Support', 'No parking space', 'In Progress', '2025-12-22 12:58:40', 4),
(11, 'Abu Sufiyan', '01322856512', 'Residential', 'Merisa', '3', 'B3', 'Material Concern', 'Low Quality ', 'Pending', '2025-12-24 11:08:56', 4),
(12, 'Abu Sufiyan', '01322856512', 'Residential', 'Rangs Kamal Residence', '8', 'A8', 'Parking Arrangement', 'Dhksksm', 'In Progress', '2026-01-03 07:23:21', 5),
(13, 'Wahid', '0178623784', 'Residential', '215 Premises', '0', 'Mitshubishi', 'Parking Arrangement', 'l;krkpog', 'Pending', '2026-01-19 10:16:58', 4);

-- --------------------------------------------------------

--
-- Table structure for table `ticket_images`
--

CREATE TABLE `ticket_images` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket_images`
--

INSERT INTO `ticket_images` (`id`, `ticket_id`, `file_path`) VALUES
(1, 1, 'uploads\\1765789295017-1000036907.jpg'),
(2, 1, 'uploads\\1765789295020-1000036934.jpg'),
(3, 2, 'uploads\\1766041089595-1000037091.jpg'),
(4, 2, 'uploads\\1766041089599-1000036962.jpg'),
(5, 3, 'public/uploads/1766132623573-251171246.png'),
(6, 3, 'public/uploads/1766132623678-580668375.png'),
(7, 4, 'public/uploads/1766300110849-944387286.png'),
(8, 4, 'public/uploads/1766300110866-177450610.PNG'),
(9, 5, 'public/uploads/1766300245152-506986065.jpg'),
(10, 5, 'public/uploads/1766300245180-141820971.jpg'),
(11, 6, 'public/uploads/1766300289635-98590223.png'),
(12, 6, 'public/uploads/1766300289638-572068177.PNG'),
(13, 7, 'public/uploads/1766300688425-653244133.jpg'),
(14, 7, 'public/uploads/1766300688519-517193688.jpg'),
(15, 8, 'public/uploads/1766303856103-172263452.jpg'),
(16, 8, 'public/uploads/1766303856103-206874926.jpg'),
(17, 10, 'public/uploads/1766408316055-531982335.jpg'),
(18, 10, 'public/uploads/1766408319606-326844597.jpg'),
(19, 11, 'public/uploads/1766574536020-490274191.jpg'),
(20, 12, 'public/uploads/1767425001358-735931344.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_updates`
--

CREATE TABLE `ticket_updates` (
  `id` int(11) NOT NULL,
  `ticket_id` int(11) NOT NULL,
  `note` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ticket_updates`
--

INSERT INTO `ticket_updates` (`id`, `ticket_id`, `note`, `created_at`) VALUES
(1, 1, 'Need Some Cables', '2025-12-18 06:49:43'),
(2, 1, 'Pump Motor', '2025-12-18 06:50:03'),
(3, 10, 'Need to Visit this Place', '2025-12-23 10:02:12'),
(4, 11, 'Glass needed', '2025-12-24 11:10:26'),
(5, 9, 'There are no need', '2026-01-19 10:14:06');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` int(11) NOT NULL,
  `building_id` int(11) NOT NULL,
  `floor_no` int(11) NOT NULL,
  `unit_name` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `building_id`, `floor_no`, `unit_name`, `created_at`) VALUES
(40, 13, -3, 'B3', '2026-01-05 07:19:14'),
(41, 13, -2, 'B2', '2026-01-05 07:19:14'),
(42, 13, -1, 'B1', '2026-01-05 07:19:14'),
(43, 13, 0, 'Mercedes', '2026-01-05 07:19:14'),
(44, 13, 0, 'Fair Auto (Hyundai)', '2026-01-05 07:19:14'),
(45, 13, 1, 'DHS Motor(Honda)', '2026-01-05 07:19:14'),
(46, 13, 1, 'Empty', '2026-01-05 07:19:14'),
(47, 13, 2, 'DHS Autos', '2026-01-05 07:19:14'),
(48, 13, 2, 'Spazio', '2026-01-05 07:19:14'),
(49, 13, 3, 'DHS Motor (Honda)', '2026-01-05 07:19:14'),
(50, 13, 3, 'Wedesing Studio', '2026-01-05 07:19:14'),
(51, 13, 4, 'Empty', '2026-01-05 07:19:14'),
(52, 13, 5, 'Pioneer Insurance', '2026-01-05 07:19:14'),
(53, 13, 6, 'Edison Group(Edison Electronics Ltd, Edison Power ', '2026-01-05 07:19:14'),
(54, 13, 7, 'Edison Group (Symphony, EDISON Technologies Ltd,Ed', '2026-01-05 07:19:14'),
(55, 13, 8, 'Edison Group', '2026-01-05 07:19:14'),
(56, 13, 9, 'Edison Real Estate', '2026-01-05 07:19:14'),
(57, 13, 9, 'Young Labels', '2026-01-05 07:19:14'),
(58, 13, 10, 'Edison Real Estate', '2026-01-05 07:19:14'),
(59, 13, 11, 'Rangs Properties Limited', '2026-01-05 07:19:14'),
(60, 13, 12, 'Empty', '2026-01-05 07:19:14'),
(61, 14, -2, 'B2', '2026-01-13 05:45:31'),
(62, 14, -1, 'B1', '2026-01-13 05:45:31'),
(63, 14, 0, 'GF', '2026-01-13 05:45:31'),
(64, 14, 1, '1A', '2026-01-13 05:45:31'),
(65, 14, 2, '2A', '2026-01-13 05:45:31'),
(66, 14, 3, '3A', '2026-01-13 05:45:31'),
(67, 14, 4, '4A', '2026-01-13 05:45:31'),
(68, 14, 5, '5A', '2026-01-13 05:45:31'),
(69, 14, 6, '6A', '2026-01-13 05:45:31'),
(70, 14, 7, '7A', '2026-01-13 05:45:31'),
(71, 14, 8, '8A', '2026-01-13 05:45:31'),
(72, 14, 9, '9A', '2026-01-13 05:45:31'),
(73, 14, 10, '10A', '2026-01-13 05:45:31'),
(74, 14, 11, '11A', '2026-01-13 05:45:31'),
(75, 14, 12, '12A', '2026-01-13 05:45:31'),
(76, 15, -2, 'B2-A', '2026-01-14 11:50:30'),
(77, 15, -2, 'B2-B', '2026-01-14 11:50:30'),
(78, 15, -1, 'B1-A', '2026-01-14 11:50:30'),
(79, 15, -1, 'B1-B', '2026-01-14 11:50:30'),
(80, 15, 0, 'GF-A', '2026-01-14 11:50:30'),
(81, 15, 0, 'GF-B', '2026-01-14 11:50:30'),
(82, 15, 1, '1A', '2026-01-14 11:50:30'),
(83, 15, 1, '1B', '2026-01-14 11:50:30'),
(84, 15, 2, '2A', '2026-01-14 11:50:30'),
(85, 15, 2, '2B', '2026-01-14 11:50:30'),
(86, 15, 3, '3A', '2026-01-14 11:50:30'),
(87, 15, 3, '3B', '2026-01-14 11:50:30'),
(88, 15, 4, '4A', '2026-01-14 11:50:30'),
(89, 15, 4, '4B', '2026-01-14 11:50:30'),
(90, 15, 5, '5A', '2026-01-14 11:50:30'),
(91, 15, 5, '5B', '2026-01-14 11:50:30'),
(92, 15, 6, '6A', '2026-01-14 11:50:30'),
(93, 15, 6, '6B', '2026-01-14 11:50:30'),
(94, 15, 7, '7A', '2026-01-14 11:50:30'),
(95, 15, 7, '7B', '2026-01-14 11:50:30'),
(96, 15, 8, '8A', '2026-01-14 11:50:30'),
(97, 15, 8, '8B', '2026-01-14 11:50:30'),
(98, 15, 9, '9A', '2026-01-14 11:50:30'),
(99, 15, 9, '9B', '2026-01-14 11:50:30'),
(100, 15, 10, '10A', '2026-01-14 11:50:30'),
(101, 15, 10, '10B', '2026-01-14 11:50:30'),
(102, 15, 11, '11A', '2026-01-14 11:50:30'),
(103, 15, 11, '11B', '2026-01-14 11:50:30'),
(104, 15, 12, '12A', '2026-01-14 11:50:30'),
(105, 15, 12, '12B', '2026-01-14 11:50:30'),
(106, 16, 0, 'MG', '2026-01-19 10:15:16'),
(107, 16, 0, 'Mitshubishi', '2026-01-19 10:15:16'),
(108, 16, 1, 'IAL', '2026-01-19 10:15:16'),
(109, 16, 2, 'RPL', '2026-01-19 10:15:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `admin_assignments`
--
ALTER TABLE `admin_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `building_id` (`building_id`);

--
-- Indexes for table `buildings`
--
ALTER TABLE `buildings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_to` (`assigned_to`);

--
-- Indexes for table `ticket_images`
--
ALTER TABLE `ticket_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Indexes for table `ticket_updates`
--
ALTER TABLE `ticket_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`),
  ADD KEY `units_ibfk_1` (`building_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `admin_assignments`
--
ALTER TABLE `admin_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `buildings`
--
ALTER TABLE `buildings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `ticket_images`
--
ALTER TABLE `ticket_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `ticket_updates`
--
ALTER TABLE `ticket_updates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_assignments`
--
ALTER TABLE `admin_assignments`
  ADD CONSTRAINT `admin_assignments_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admin_assignments_ibfk_2` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ticket_images`
--
ALTER TABLE `ticket_images`
  ADD CONSTRAINT `ticket_images_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ticket_updates`
--
ALTER TABLE `ticket_updates`
  ADD CONSTRAINT `ticket_updates_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `units`
--
ALTER TABLE `units`
  ADD CONSTRAINT `units_ibfk_1` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
