import { useNavigate } from "react-router-dom";

interface Admin {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

const admins: Admin[] = [
  {
    id: "marita",
    name: "Marita",
    email: "marita@funnelcracks.com",
    initials: "M",
    color: "bg-pink-500",
  },
  {
    id: "gonzalo",
    name: "Gonzalo",
    email: "gonzalo@funnelcracks.com",
    initials: "G",
    color: "bg-blue-600",
  },
];

export const AdminUserSelectPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelectAdmin = (adminId: string) => {
    sessionStorage.setItem("adminUser", adminId);
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¿QUIÉN ERES?
          </h2>
          <p className="text-gray-600 text-sm">
            Selecciona tu nombre para continuar
          </p>
        </div>

        <div className="space-y-4">
          {admins.map((admin) => (
            <button
              key={admin.id}
              onClick={() => handleSelectAdmin(admin.id)}
              className="w-full flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200"
            >
              <div className={`${admin.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">
                  {admin.initials}
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{admin.name}</p>
                <p className="text-sm text-gray-600">{admin.email}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => window.history.back()}
          className="w-full mt-6 text-gray-600 hover:text-gray-800 font-medium text-sm"
        >
          ← Volver
        </button>
      </div>
    </div>
  );
};
