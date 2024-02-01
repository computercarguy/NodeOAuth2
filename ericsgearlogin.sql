-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 01, 2024 at 10:27 PM
-- Server version: 10.1.28-MariaDB
-- PHP Version: 5.6.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ericsgearlogin`
--

-- --------------------------------------------------------

--
-- Table structure for table `access_tokens`
--

CREATE TABLE `access_tokens` (
  `AccessToken` text,
  `UserId` int(11) NOT NULL,
  `ExpirationDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `passwordreset`
--

CREATE TABLE `passwordreset` (
  `UserId` int(11) NOT NULL,
  `Guid` text NOT NULL,
  `Email` text NOT NULL,
  `CreatedOn` datetime DEFAULT CURRENT_TIMESTAMP,
  `ExpiresAt` datetime AS (CreatedOn + INTERVAL 30 MINUTE) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `Id` int(11) NOT NULL,
  `Username` text,
  `UserPassword` text,
  `FirstName` text,
  `LastName` text,
  `Business` tinyint(4) DEFAULT NULL,
  `BusinessName` text,
  `Email` text,
  `Address1` text,
  `Address2` text,
  `City` text,
  `State` text,
  `Zipcode` text,
  `Country` varchar(2) DEFAULT NULL,
  `Active` tinyint(4) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `whitelist`
--

CREATE TABLE `whitelist` (
  `Id` int(11) NOT NULL,
  `Domain` text NOT NULL,
  `CreatedDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Active` tinyint(1) NOT NULL,
  `OwnerUserId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD KEY `fk_access_tokens_user` (`UserId`);

--
-- Indexes for table `passwordreset`
--
ALTER TABLE `passwordreset`
  ADD KEY `fk_passwordreset_user` (`UserId`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `whitelist`
--
ALTER TABLE `whitelist`
  ADD PRIMARY KEY (`Id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `whitelist`
--
ALTER TABLE `whitelist`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `access_tokens`
--
ALTER TABLE `access_tokens`
  ADD CONSTRAINT `fk_access_tokens_user` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`);

--
-- Constraints for table `passwordreset`
--
ALTER TABLE `passwordreset`
  ADD CONSTRAINT `fk_passwordreset_user` FOREIGN KEY (`UserId`) REFERENCES `users` (`Id`);

DELIMITER $$
--
-- Events
--
CREATE DEFINER=`root`@`localhost` EVENT `DeleteExpiredTokens` ON SCHEDULE EVERY 1 DAY STARTS '2023-09-23 01:00:00' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM access_tokens WHERE ExpirationDate <= NOW()$$

CREATE DEFINER=`root`@`localhost` EVENT `DeleteUsedPasswordResets` ON SCHEDULE EVERY 1 DAY STARTS '2023-09-27 01:00:00' ON COMPLETION NOT PRESERVE ENABLE DO DELETE FROM passwordreset
WHERE ExpiresAt <= NOW()$$

DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
