-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Oct 18, 2019 at 06:35 AM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `natures_palette`
--

-- --------------------------------------------------------

--
-- Table structure for table `files`
--

CREATE TABLE IF NOT EXISTS `files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` text NOT NULL,
  `description` text NOT NULL,
  `path` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7 ;

--
-- Dumping data for table `files`
--

INSERT INTO `files` (`id`, `file_name`, `description`, `path`) VALUES
(1, '11444.00000001.Master.Transmission', 'lorem ipsum dolor sit amet', '11444.00000001.Master.Transmission'),
(2, '11444.00000002.Master.Transmission', 'lorem ipsum dolor sit amet', '11444.00000002.Master.Transmission'),
(3, '11444.00000003.Master.Transmission', 'lorem ipsum dolor sit amet', '11444.00000003.Master.Transmission'),
(4, '11444.00000004.Master.Transmission', 'lorem ipsum dolor sit amet', '11444.00000004.Master.Transmission'),
(5, '11444.00000005.Master.Transmission', 'lorem ipsum dolor sit amet', '11444.00000005.Master.Transmission'),
(6, '2019.09.19 Example of Metadata file limited Darwin core terms.csv', 'Meta data file', '2019.09.19 Example of Metadata file limited Darwin core terms.csv');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
