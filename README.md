

## Cài đặt và chạy

### Yêu cầu

- Java 17 hoặc cao hơn
- Maven 3.6+
- MongoDB 4.4+ (đang chạy trên localhost:27017)

### Cấu hình MongoDB

1. Cài đặt MongoDB và đảm bảo MongoDB đang chạy
2. Cấu hình trong `application.properties`:
   ```properties
   spring.data.mongodb.host=localhost
   spring.data.mongodb.port=27017
   spring.data.mongodb.database=restaurant_db
   ```

### Chạy ứng dụng

```bash
# Build project
mvn clean install

# Chạy ứng dụng
mvn spring-boot:run
```

Ứng dụng sẽ chạy tại: `http://localhost:8080`

