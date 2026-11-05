# FurnitureShopApp

Ứng dụng bán bàn ghế trên Android, sử dụng React Native/Expo và backend Java Spring Boot.

Tác giả: Nguyen Minh Tung.

## Chuẩn bị lần đầu

- Cài **Node.js**, **JDK 17** và **Android Studio** với Android SDK, Platform Tools và Android Emulator.
- Tạo máy ảo trong **Android Studio → Device Manager**.
- Cài **Expo Go dành cho SDK 53** vào máy ảo. Máy ảo hiện tại đã được cài sẵn.
- Mở thư mục gốc dự án trong VS Code, mở terminal và cài thư viện app nếu chưa có:

```powershell
npm.cmd run install:app
```

## Chạy chương trình

Mở **hai terminal** tại thư mục gốc dự án (`D:\Tung\AppBanghe`).

**Terminal 1 — chạy backend:**

```powershell
npm.cmd run backend
```

Chờ xuất hiện `Started FurnitureApiApplication`.

**Terminal 2 — chạy app Android:**

```powershell
npm.cmd run dev
```

Lệnh tự bật máy ảo đầu tiên nếu chưa có máy ảo đang chạy, chờ Android khởi động rồi mở app bằng Expo Go. Giữ cả hai terminal mở trong lúc sử dụng.

Chọn **Đăng ký ngay** trên màn hình đăng nhập nếu cần tạo tài khoản.

## Khi phát triển

- Sửa code app rồi lưu để xem cập nhật; có thể nhấn `r` trong terminal Expo để tải lại.
- Nhấn **Ctrl+C** trong từng terminal để dừng, sau đó đóng máy ảo nếu không dùng nữa.
- Chỉ chạy một backend và một Expo để tránh trùng cổng.
- Nếu PowerShell báo `npm.ps1 cannot be loaded`, dùng `npm.cmd run backend` và `npm.cmd run dev` (tương tự với `install:app`), hoặc mở terminal **Command Prompt** trong VS Code.
- Nếu vừa cài phần mềm và terminal chưa nhận `npm`, đóng và mở lại VS Code.

## Địa chỉ và dữ liệu

| Thành phần | Địa chỉ / vị trí |
|---|---|
| Backend | `http://localhost:8080` |
| Tài liệu API | http://localhost:8080/swagger-ui.html |
| API sản phẩm | http://localhost:8080/api/products |
| Expo/Metro | Cổng `8081` |
| API app gọi từ máy ảo | `http://10.0.2.2:8080`, cấu hình trong `App-Main/furniture-app/src/services/api.ts` |
| Cơ sở dữ liệu | `furniture-api-main/furniture.db` |
| Ảnh sản phẩm | `furniture-api-main/uploads` |

Script Android bỏ các bước kiểm tra trực tuyến của Expo để chạy với Expo Go SDK 53 đã cài; app vẫn kết nối backend bình thường. Nếu tạo máy ảo mới, cần cài lại [Expo Go dành cho SDK 53](https://expo.dev/go?platform=android&device=false&sdkVersion=53).

Tài khoản admin: admin
                123456
                
