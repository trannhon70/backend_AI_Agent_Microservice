<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## lệnh start từng service, gateway là 1 service
npm run start gateway

## lệnh tạo libs
nest g library proto  

## lệnh tạo monorepo apps service
nest g app analytics-service     

## các bước thực hiện backup database và import database
1. Copy file backup.dump vào container: 
  - docker cp ./backup.dump postgres:/tmp/backup.dump
2. Restore vào database livechat: 
  - docker exec -t postgres pg_restore -U postgres -d livechat --clean --if-exists /tmp/backup.dump
3. Nếu database livechat chưa tồn tại, tạo trước:
  - docker exec -t postgres createdb -U postgres livechat
  - docker exec -t postgres pg_restore -U postgres -d livechat /tmp/backup.dump

 ## Trường hợp	HTTP Status
Email không tồn tại	404 NOT_FOUND hoặc 401 UNAUTHORIZED (để tránh lộ thông tin)
Sai mật khẩu	401 UNAUTHORIZED
Tài khoản đã bị xóa	403 FORBIDDEN
Tài khoản bị khóa	403 FORBIDDEN
Dữ liệu gửi lên sai định dạng	400 BAD_REQUEST

## Lệnh chạy docker
- docker-compose up -d --build
- docker-compose down

# Lệnh build lên docker và chạy api trên docker
  - docker compose up -d --build gateway
  - xem log của docker:  docker compose logs -f gateway || docker compose logs -f auth-service

## Link xem log kafka
- http://localhost:9000/

# Cách đăng ký server đúng cho pgAdmin trong Docker Trong trang localhost:5050/browser/:

1. Chuột phải vào Servers → Register → Server...
2. Tab General: 
  - Name: đặt tên tùy ý, ví dụ AI_Agent Local
3. Tab Connection:
  - Host name/address: postgres ← dùng tên service trong compose, KHÔNG phải localhost
  - Port: 5432 ← port nội bộ trong Docker network, KHÔNG phải 5431
  - Maintenance database: postgres (an toàn nhất để connect trước — không phải AI_Agent)
  - Username: postgres
  - Password: 1q2w3e4r
4. Save password?: bật lên cho tiện
  - Bấm Save

## lệnh backup dữ liệu rồi bỏ dữ liệu vào /wwww
docker exec -t postgres pg_dump -U postgres livechat > backup.sql

## Bước 1: convert UTF-16 → UTF-8
iconv -f UTF-16 -t UTF-8 /www/backup.sql -o /www/backup_utf8.sql

## Bước 2: import lại vào PostgreSQL
cat /www/backup_utf8.sql | docker exec -i postgres psql -U postgres -d livechat

## redis server config lại

maxmemory 1gb
maxmemory-policy allkeys-lru
notify-keyspace-events Ex

## lệnh start ngrok
ngrok http 5000

## google console 
https://console.cloud.google.com/apis/credentials?project=onbai-449403

## doc facebook
https://developers.facebook.com/apps/

## doc telegram
https://my.telegram.org/apps

## Thêm cột search_vector
npm run typeorm migration:create src/database/migrations/AddConversationSearchVector

## revert lại migration
npm run typeorm -- migration:revert -d src/database/data-source.ts
## lệnh chạy migration
npm run typeorm migration:run -- -d src/database/data-source.ts

## Tạo bảng mới 
npm run typeorm -- migration:generate src/database/migrations/CreateFilesTable -d src/database/data-source.ts

## 1. Xem toàn bộ index của 1 bảng
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'conversations';

## các kỹ thuật đánh index nâng cao của PostgreSQL
1. Primary Key Index (luôn có)

2. Unique Index "Cho các field phải duy nhất."
  - Ví dụ: email username slug code 
  - SQL: CREATE UNIQUE INDEX idx_users_email ON users(email) hoặc ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE(email);

3. Composite Index (được dùng nhiều nhất) "Đây là loại được dùng nhiều nhất trong doanh nghiệp."
  - Ví dụ: API: GET /users?page=1 "ORDER BY created_at DESC"
  - CREATE INDEX idx_users_created ON users(created_at DESC);

4. Partial Index (rất phổ biến)
  - Ví dụ: API: is_deleted=false "ORDER BY created_at DESC"
  - CREATE INDEX idx_users_active ON users(created_at DESC) WHERE is_deleted=false; "Index chỉ lưu user active, Nhanh hơn rất nhiều."

5. Covering Index (INCLUDE) "Postgres 11+"
  - Ví dụ: SELECT id,name,email FROM users WHERE provider='google'.
  - CREATE INDEX idx_users_provider ON users(provider) INCLUDE(name,email); "Database không cần đọc table. Chỉ đọc index"

6. Full Text Search Index (GIN)
 - Search tất cả từ (AND): plainto_tsquery()
 - Search OR: to_tsquery()
 - Search NOT: websearch_to_tsquery()
 - Search Phrase (đúng cụm): phraseto_tsquery()

7. Foreign Key Index "Postgres KHÔNG tự tạo index cho foreign key."
  - Ví dụ: posts.user_id
  - CREATE INDEX idx_posts_user ON posts(user_id); "Nếu không JOIN sẽ rất chậm"

9. JSONB Index (Nếu dùng JSONB)
  - metadata jsonb
  - CREATE INDEX idx_metadata ON products USING GIN(metadata);

10. Expression Index
  - Ví dụ: LOWER(email) => CREATE INDEX idx_lower_email ON users(LOWER(email));
  - Query => WHERE LOWER(email)=LOWER($1)
  
11. BRIN Index (Cho bảng cực lớn)
  - Ví dụ log: created_at
  - CREATE INDEX idx_logs_created ON logs USING BRIN(created_at);

## Thứ tự ưu tiên khi thiết kế index
1. Tạo các index bắt buộc: Primary Key, Unique và Foreign Key.
2. Thêm Composite Index dựa trên các câu WHERE, ORDER BY, JOIN và phân trang xuất hiện thường xuyên.
3. Dùng Partial Index nếu dữ liệu thường được lọc theo một điều kiện cố định như is_deleted = false hoặc status = 'ACTIVE'.
4. Dùng GIN cho tsvector, jsonb hoặc pg_trgm khi cần tìm kiếm toàn văn, JSON hoặc chuỗi gần đúng.
5. Theo dõi bằng EXPLAIN ANALYZE để xem truy vấn thực tế có sử dụng index không. Nếu một index không bao giờ được dùng, hãy cân nhắc loại bỏ để giảm chi phí ghi và dung lượng lưu trữ.

## các loại index có giá trị nhất sẽ là:
- B-tree (mặc định): cho PK, FK, WHERE, ORDER BY, JOIN.
- Composite Index: tối ưu các truy vấn nhiều điều kiện như (page_id, updated_at DESC, id).
- Partial Index: cho các điều kiện như is_deleted = false.
- GIN Index: cho search_vector và nếu dùng jsonb hoặc pg_trgm.
- Expression Index: nếu thường xuyên tìm kiếm không phân biệt hoa thường (LOWER(email) chẳng hạn).

## store lưu cnd file 
https://console.cloudinary.com/app/c-45c6bd6465bbb5f74168580c9d2082/home/delivery-reports