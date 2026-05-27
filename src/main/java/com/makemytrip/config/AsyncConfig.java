package com.makemytrip.config;
import com.makemytrip.constants.AppConstants;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.*;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig implements AsyncConfigurer {
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(AppConstants.ASYNC_CORE_POOL_SIZE);
        executor.setMaxPoolSize(AppConstants.ASYNC_MAX_POOL_SIZE);
        executor.setQueueCapacity(AppConstants.ASYNC_QUEUE_CAPACITY);
        executor.setThreadNamePrefix(AppConstants.ASYNC_THREAD_PREFIX);
        executor.initialize();
        return executor;
    }
}
