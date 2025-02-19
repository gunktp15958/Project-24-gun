import { useState } from 'react';
import DataTable from 'react-data-table-component';

export default function CourseItems({ courses, onShowBranches }) {
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredData = courses.filter((courses) =>   // Filter the data based on the search term
    courses.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: 'Course code',
      selector: (row) => row.course_code,
      sortable: true,
    },
    {
      name: 'Curriculum',
      selector: (row) => row.curriculum,
      sortable: true,
    },
    {
      name: 'Thai Name',
      selector: (row) => row.th_name,
      sortable: true,
      cell: (row) => <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>{row.th_name}</div>,
    },
    {
      name: 'English Name',
      selector: (row) => row.eng_name,
      sortable: true,
      cell: (row) => <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>{row.eng_name}</div>,
    },
    {
      name: 'Credit',
      selector: (row) => row.credit,
      sortable: true,
    },
    {
      name: 'Course Type',
      selector: (row) => row.course_type,
      sortable: true,
    }
  ];

  return (
    <>
      <button className='col-span-8 rounded text-white font-bold bg-blue-500 hover:bg-blue-700 ms-10 mb-3 py-2 px-4'
        onClick={onShowBranches}>
        Return to Branch
      </button>
      <br />
      <input className='ms-10  mt-5 mb-4 px-2 py-1 rounded border'
        type='text'
        placeholder='Search by ID'
        value={searchTerm}
        onChange={handleSearch}
      />

      <div className='ms-10 w-[90%] -z-[10]'>
        <DataTable
          columns={columns}
          data={filteredData}
          highlightOnHover
          striped
          responsive
          pagination
        />
      </div>
    </>
  );
}

