import { useState } from 'react';
import { createPortal } from 'react-dom';
import Papa from 'papaparse'; // Library for parsing CSV files

import Table from '../components/Table';
import TableRow from '../components/TableRow';
import AddCourseSideBar from '../components/AddCourseSideBar';

import transferIcon from '../../assets/transfer.png';
import Manualimport from '../components/ManualImport';
import { useImportCourseMutation } from '../../context/Admin-Context';

const currentYear = (new Date().getFullYear() + 543) % 100;

const generateOptions = () => {
  const options = [];
  for (let i = 0; i < 100; i++) {
    const value = i.toString().padStart(2, '0');
    options.push(
      <option key={i} value={value}>
        {value}
      </option>
    );
  }
  return options;
};

export default function AddCourseModal({ courseTag, branchTag, isVisible, onClose }) {
  const importCourseMutation = useImportCourseMutation();

  const [selectedCurriculum, setSelectedCurriculum] = useState(currentYear);
  const [importedData, setImportedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const options = generateOptions();

  const handleImportDatabase = () => {
    importCourseMutation.mutate(
      filteredData,
      {
        onSuccess: (res) => {
          alert(res.message);
        },
        onError: (error) => {
          console.error('Import failed:', error);
          alert(error);
        }
      }
    );
  }; //Backend API

  const handleImport = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = handleFileLoad;
    reader.readAsText(file);
  };

  const handleFileLoad = (e) => {
    const text = e.target.result;
    const result = Papa.parse(text, { header: true }); // Parsing CSV data with headers
    console.log(result)

    const dataWithTags = result.data.map((item) => ({
      ...item,
      branch_tag: branchTag,
      course_tag: courseTag,
      curriculum: selectedCurriculum,
    }));

    setImportedData(dataWithTags);
  };

  const handleManualLoad = manual => {
    const dataWithTags = manual.map((item) => ({
      ...item,
      branch_tag: branchTag,
      course_tag: courseTag,
      curriculum: selectedCurriculum,
    }));
    setImportedData(prevData => [...dataWithTags, ...prevData]);
  } //use for add manual course importedData

  const filterDataByCourseTag = () => {
    const filtered = importedData.filter((row) =>
      row.course_code.startsWith(courseTag)
    );
    console.log(filtered);
    if (filtered.length === 0) {
      return;
    }
    setFilteredData(filtered);

    const remainingData = importedData.filter(
      (row) => !row.course_code.startsWith(courseTag)
    );
    setImportedData(remainingData);
  };

  const handleTransfer = (rowData) => {
    setFilteredData((prevFilteredData) => [...prevFilteredData, rowData]);
    setImportedData((prevImportedData) =>
      prevImportedData.filter((item) => item === rowData)
    );
  };

  const handleCurriculumChange = (e) => {
    const newCurriculum = e.target.value;
    setSelectedCurriculum(newCurriculum);

    // Update the curriculum value for each item in the importedData array
    const updatedData = importedData.map((item) => ({
      ...item,
      curriculum: newCurriculum
    }));

    setImportedData(updatedData);
  };

  return (
    isVisible && (
      <PortalContainer>
        <AddCourseSideBar
          options={options}
          courseTag={courseTag}
          selectedCurriculum={selectedCurriculum}
          handleCurriculumChange={handleCurriculumChange}
          handleImport={handleImport}
          onClose={onClose}
        />

        <div className='w-full flex flex-col rounded-lg bg-slate-400'>
          <Table bg={'bg-orange-200'} text='Validation table'>
            <tbody className='divide-y bg-white divide-gray-200'>
              {importedData.map((rowData, index) => (
                <TableRow
                  key={index}
                  courseCode={rowData.course_code}
                  defaultCurriculum={rowData.curriculum}
                  thName={rowData.th_name}
                  engName={rowData.eng_name}
                  credits={rowData.credit}
                  courseType={rowData.course_type}
                  rowData={rowData}
                  onTransfer={handleTransfer}
                  options={options}
                />
              ))}
            </tbody>
          </Table>

          <TableValidation filterDataByCourseTag={filterDataByCourseTag} />

          <Table bg='bg-emerald-200' text='Import table'>
            <tbody className='divide-y bg-white divide-gray-200'>
              {filteredData.map((rowData, index) => (
                <TableRow
                  key={index}
                  courseCode={rowData.course_code}
                  defaultCurriculum={rowData.curriculum}
                  thName={rowData.th_name}
                  engName={rowData.eng_name}
                  credits={rowData.credit}
                  courseType={rowData.course_type}
                  rowData={rowData}
                  onTransfer={null}
                  options={options}
                />
              ))}
            </tbody>
          </Table>

          <TableImportButton handleImportDatabase={handleImportDatabase} />
        </div>
        {/* ----------Manualimport--------------- */}
        <Manualimport yearOptions={options} handleManualLoad={handleManualLoad} />
      </PortalContainer>
    )
  );
}

const PortalContainer = ({ children }) => {
  return createPortal(
    <div className='w-screen h-screen fixed flex bg-gray-800 bg-opacity-50 z-[10]'>
      {children}
    </div>,
    document.getElementById('root-modal')
  );
};

function TableImportButton({ handleImportDatabase }) {
  return (
    <div className='flex justify-center my-4'>
      <button
        className='font-bold text-white rounded bg-green-500 hover:bg-green-700 py-2 px-6 '
        onClick={handleImportDatabase}>
        Import to Database
      </button>
    </div>
  );
}

function TableValidation({ filterDataByCourseTag }) {
  return (
    <div className='flex justify-center my-10'>
      <button className='inline-block' onClick={filterDataByCourseTag}>
        <img src={transferIcon} alt='transfer icon' className='h-16' />
      </button>
    </div>
  );
}
