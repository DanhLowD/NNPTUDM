# Angular Overview (Cơ Bản)

## Angular là gì?

Angular là framework frontend của Google dùng để xây dựng ứng dụng web theo hướng component-based. Angular phù hợp với các dự án có cấu trúc rõ ràng, cần mở rộng lâu dài và có nhiều chức năng.

## Vì sao nên dùng Angular?

- Cấu trúc dự án chuẩn, dễ quản lý khi team lớn.
- TypeScript mặc định, giảm lỗi runtime.
- Router, Form, HTTP, Validation có sẵn trong hệ sinh thái.
- Hỗ trợ tốt cho kiến trúc enterprise.

## 5 khái niệm quan trọng

### 1) Component

Mỗi phần UI được tách thành component độc lập gồm:

- `template` (HTML)
- `style` (CSS/SCSS)
- `logic` (TypeScript)

Component giúp tái sử dụng giao diện và tách biệt trách nhiệm.

### 2) Data Binding

Angular cung cấp 4 kiểu binding chính:

- Interpolation: `{{ value }}`
- Property binding: `[disabled]="isLoading"`
- Event binding: `(click)="onSubmit()"`
- Two-way binding: `[(ngModel)]="form.name"`

### 3) Dependency Injection (DI)

Service được inject vào component thay vì khởi tạo thủ công:

- Dễ test
- Dễ thay thế implementation
- Giảm coupling

### 4) Routing

Angular Router cho phép chia app theo trang:

- Cấu hình route trong `app.routes.ts`
- Hỗ trợ lazy loading để tối ưu hiệu năng
- Hỗ trợ guard để kiểm tra quyền truy cập

### 5) Service + HTTP

API call thường đặt trong service (không viết trực tiếp trong component):

- Tái sử dụng logic gọi API
- Tập trung xử lý token, error, retry
- Giữ component gọn và dễ đọc

## Angular hiện đại: Standalone + Signals

Trong các phiên bản mới, Angular khuyến khích:

- **Standalone Components**: không cần `NgModule` cho phần lớn trường hợp.
- **Signals**: quản lý state reactive đơn giản, dễ theo dõi hơn.
- **Control Flow mới**: `@if`, `@for`, `@switch` thay cho cú pháp template cũ.

## Cấu trúc thư mục gợi ý

```text
src/app/
├── components/    # UI theo màn hình/chức năng
├── services/      # gọi API và business logic
├── models/        # interface/type
├── guards/        # route guards
└── shared/        # component, pipe, directive dùng chung
```

## Luồng xử lý cơ bản trong app

1. User thao tác trên UI.
2. Component gọi method trong service.
3. Service gọi backend qua `HttpClient`.
4. Response trả về và cập nhật state.
5. UI tự động render lại.

## Best practices cho người mới

- Giữ component "mỏng", đưa logic nặng sang service.
- Đặt tên file/symbol rõ nghĩa, theo feature.
- Tách interface/model riêng.
- Dùng guard/interceptor cho auth thay vì lặp code.
- Viết test cơ bản cho service quan trọng.
