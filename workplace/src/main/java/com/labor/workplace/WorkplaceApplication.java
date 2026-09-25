package com.labor.workplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import com.labor.workplace.service.UserService;
import com.labor.workplace.repository.WorkerProfileRepository;

import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class WorkplaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkplaceApplication.class, args);
	}

	@Bean
	public CommandLineRunner run(UserService userService, WorkerProfileRepository workerProfileRepository) {
		return args -> {
			userService.seedAdmin();
			userService.seedUsersAndWorkers(workerProfileRepository);
		};
	}
}
