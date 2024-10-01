const getData = () => {
  firebase.database().ref("users").once("value")
    .then((snapshot) => {
      if (snapshot.exists()) {
        const users = [];
        const keys = [];
        snapshot.forEach((childSnapshot) => {
          const userData = childSnapshot.val();
          const userKey = childSnapshot.key;
          users.push(userData);
          keys.push(userKey);
        });
        const userTableBody = document.querySelector('#userTable tbody');
        userTableBody.innerHTML = '';

        users.forEach((user, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>*********</td>
            <td>
              <button class="detail-btn btn btn-info" data-index="${index}" data-toggle="modal" data-target="#userDetailModal">Detail</button>
              <button class="delete-btn btn btn-danger" data-index="${index}">Delete</button>
              <button class="edit-btn btn btn-warning" data-index="${index}" data-toggle="modal" data-target="#userEditModal">Edit</button>
            </td>
          `;
          userTableBody.appendChild(row);
        });

        // Xử lý sự kiện cho nút Detail
        document.querySelectorAll('.detail-btn').forEach((button) => {
          button.addEventListener('click', (e) => {
            const userIndex = e.target.dataset.index;
            const user = users[userIndex];

            document.getElementById('modalUsername').textContent = user.username;
            document.getElementById('modalEmail').textContent = user.email;
            document.getElementById('modalPassword').textContent = user.password;
          });
        });

        // Xử lý sự kiện cho nút Edit
        document.querySelectorAll('.edit-btn').forEach((button) => {
          button.addEventListener('click', (e) => {
            const userIndex = e.target.dataset.index;
            const user = users[userIndex];

            // Cập nhật thông tin người dùng trong modal Edit
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editPassword').value = user.password;
            document.getElementById('editUserId').value = keys[userIndex]; // Lưu key để cập nhật
          });
        });

        // Xử lý sự kiện cho nút Delete
        document.querySelectorAll('.delete-btn').forEach((button) => {
          button.addEventListener('click', (e) => {
            const userIndex = e.target.dataset.index;
            const userKey = keys[userIndex];

            if (confirm(`Bạn có chắc chắn muốn xóa người dùng: ${users[userIndex].username}?`)) {
              firebase.database().ref("users").child(userKey).remove()
                .then(() => {
                  alert(`Người dùng ${users[userIndex].username} đã được xóa thành công.`);
                  getData(); // Tải lại dữ liệu
                })
                .catch((error) => {
                  console.error("Lỗi khi xóa người dùng:", error);
                });
            }
          });
        });

      } else {
        console.log("No users found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}

// Lưu thay đổi khi nhấn "Save" trong modal Edit
document.getElementById('editUserForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('editUsername').value;
  const email = document.getElementById('editEmail').value;
  const password = document.getElementById('editPassword').value;
  const userId = document.getElementById('editUserId').value;

  // Cập nhật thông tin người dùng trong Firebase
  firebase.database().ref("users").child(userId).update({
    username: username,
    email: email,
    password: password
  }).then(() => {
    alert('Thông tin người dùng đã được cập nhật.');
    $('#userEditModal').modal('hide'); // Đóng modal
    getData(); // Tải lại dữ liệu
  }).catch((error) => {
    console.error("Lỗi khi cập nhật người dùng:", error);
  });
});


const createUser = (user) => {
  // Lưu user vào Firebase
  firebase.database().ref("users").push(user)
    .then(() => {
      alert("Người dùng đã được tạo thành công!");
      document.getElementById('createUserForm').reset(); // Reset form sau khi tạo
      getData()
    })
    .catch((error) => {
      console.error("Lỗi khi tạo người dùng:", error);
      alert("Đã có lỗi xảy ra, vui lòng thử lại.");
    });
};

// Lắng nghe sự kiện submit form
document.getElementById('createUserForm').addEventListener('submit', (e) => {
  e.preventDefault(); // Ngăn không reload trang khi submit

  // Lấy giá trị từ form
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Kiểm tra dữ liệu (có thể thêm nhiều kiểm tra khác như độ dài mật khẩu)
  if (username && email && password) {
    const newUser = {
      username,
      email,
      password
    };
    // Gọi hàm để tạo user mới
    createUser(newUser);
  } else {
    alert("Vui lòng điền đầy đủ thông tin.");
  }
});

getData()