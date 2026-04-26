package com.example.DATN;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DatnApplication {

	public static void main(String[] args) {
		try {
			SpringApplication.run(DatnApplication.class, args);
		} catch (Throwable t) {
			if (t.getClass().getName().contains("SilentExitException")) {
				throw t;
			}
			System.err.println("FATAL ERROR DURING STARTUP:");
			t.printStackTrace();
			System.exit(1);
		}
	}

}
