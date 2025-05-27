import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../Components/Header.js';
import { useApi } from '../utils/api';
import edit from '../Icons/edit.png';
import save from '../Icons/save.png';

const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString();
}

const Modification = () => {
  const { dataType, id } = useParams();
  const { authFetch } = useApi();
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 把 fetchData 用 useCallback 包起來，好在 handleSave 裡面調用
  const fetchData = useCallback(async () => {
    try {
      const res = await authFetch(`${dataType}/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      const data = await res.json();
      setFormData(data);
    } catch (error) {
      console.error("Fetch failed", error);
      alert("讀取資料失敗，請稍後再試");
    }
  }, [authFetch, dataType, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await authFetch(`${dataType}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`Failed to update: ${res.status}`);
      }

      // 等 PUT 成功後，重新 GET 一次最新資料
      await fetchData();
    } catch (error) {
      console.error("Update failed", error);
      alert("更新失敗，請稍後再試");
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      handleSave();
    }
    setIsEditing(!isEditing);
  };

  if (!formData) {
    return <div className="text-center mt-20 text-xl">Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className="max-w-3xl p-6 mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold capitalize">{dataType} Info</h2>
          <img
            src={isEditing ? save : edit}
            alt={isEditing ? "save" : "edit"}
            className="size-12 cursor-pointer"
            onClick={toggleEdit}
          />
        </div>

        {Object.entries(formData).map(([key, value]) => (
          !["createdAt", "updatedAt", "__v"].includes(key) && (
            <div key={key} className="mb-2">
              <label className="block text-sm font-medium text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1')}
              </label>
              {isEditing && key !== 'id' ? (
                <input
                  type="text"
                  value={Array.isArray(value) ? JSON.stringify(value) : value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full mt-1 px-3 py-1 border rounded-md text-sm"
                />
              ) : (
                <p className="mt-1 px-3 py-1 text-sm text-gray-800 bg-gray-100 border rounded-md">
                  {Array.isArray(value) ? JSON.stringify(value) : value}
                </p>
              )}
            </div>
          )
        ))}

        <p className="text-xs text-gray-500 mt-4">
          Last Update<br />{formatDate(formData.updatedAt)}
        </p>
      </div>
    </div>
  );
};

export default Modification;
